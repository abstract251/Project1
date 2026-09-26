 缘遇后端 · LightWebServer

基于 C++20 + epoll 的轻量级 Web 服务器，支持多线程 Reactor 模型与静态资源服务。

- 目标平台：Linux / WSL2（依赖 `epoll` / `accept4` / `sys/socket.h`，Windows 原生无法编译运行）
- 构建系统：CMake ≥ 3.16，C++20
- 监听地址：`0.0.0.0:3000`（端口定义在 `include/socket.h`）
- 当前状态：静态文件服务可用（GET / HEAD），构建、运行、测试流程已跑通

---

 1. 特性

| 能力 | 说明 |
| --- | --- |
| 多 Reactor 多线程 | mainReactor 只负责 `accept`，N 个 subReactor（N = `hardware_concurrency()`）各自跑一个事件循环 |
| epoll 边缘触发 | `EPOLLIN \| EPOLLET`，配合非阻塞 socket |
| 非阻塞读写 | 读/写各有独立缓冲；写不完时注册 `EPOLLOUT` 异步续写 |
| HTTP 请求解析 | 支持半包/粘包，三态解析（`Ok` / `Wait` / `Bad`） |
| 静态资源 | `GET` / `HEAD` 读取 `www/` 下文件，按扩展名返回 Content-Type |
| 统一事件抽象 | `Channel` + `EventLoop` + `Epoll` 三层，读写回调可插拔 |

---

 2. 目录结构

```
backend/
├── CMakeLists.txt               顶层：项目名 / C++20 / 产物输出目录 / 编译选项
├── include/                     全部头文件（顶层已 include_directories(include)）
│   ├── acceptor.h  buffer.h  channel.h  connect.h  epoll.h
│   ├── error.h     event_loop.h  httprequest.h  map.h
│   ├── socket.h    tcp.h     thread.h
│   └── log.h                    占位，尚未实现
├── src/
│   ├── CMakeLists.txt
│   ├── common/                  公共静态库 common（server / client 共用）
│   │   ├── CMakeLists.txt
│   │   ├── acceptor.cpp         accept 循环：accept4(SOCK_NONBLOCK)
│   │   ├── buffer.cpp           字节缓冲：追加 / 取全部 / 从头丢弃 n 字节
│   │   ├── channel.cpp          fd + 关注事件 + 读写回调 的封装
│   │   ├── connect.cpp          ★ 单条连接：读写缓冲、请求切分、状态机
│   │   ├── epoll.cpp            epoll_create1 / ctl / wait 封装
│   │   ├── error.cpp            errif / buildError / statusCode
│   │   ├── event_loop.cpp       事件循环：poll → handle → 执行延迟任务
│   │   ├── httprequest.cpp      ★ HTTP 请求行解析 + 静态文件读取 + 响应拼装
│   │   ├── map.cpp              扩展名 → Content-Type；取扩展名
│   │   ├── socket.cpp           socket / bind / listen / connect
│   │   ├── tcp.cpp              ★ 服务器骨架：mainReactor + subReactors + 连接表
│   │   ├── thread.cpp           线程池（任务队列 + condition_variable）
│   │   └── log.cpp              占位，未加入 common 库（不参与编译）
│   ├── server/
│   │   ├── CMakeLists.txt
│   │   └── server.cpp           ★ 服务端入口：注册回调 + 启动
│   └── client/
│       ├── CMakeLists.txt
│       └── client.cpp           简易压测客户端（100 线程 × 100 次请求）
├── www/                         静态资源根目录（a.html / b.html / 404.html）
├── bin/                         构建产物（.gitignore）
└── build/                       CMake 构建目录（.gitignore）
```

> 加文件怎么改 CMake、头文件放哪、常见编译错误对照，见 `docs/后端构建与开发指南.md`。

---

 3. 构建

```bash
cd backend
cd build
cmake ..          配置（首次或改了 CMakeLists.txt 后需要）
make              编译，产物输出到 backend/bin/
```


---

 4. 运行

> 工作目录。`src/common/httprequest.cpp` 里 `define base "../www"` 是相对当前工作目录的：

| 启动方式 | `base` 实际指向 | 结果 |
| --- | --- | --- |
| `cd backend/bin && ./server` | `backend/www` | 正常服务 |
| `cd backend && ./bin/server` | `Project1/www`（不存在） | 所有 GET 返回 404 |

推荐：

```bash
cd backend/bin && ./server
```

后续计划把根目录改成启动参数 / 绝对路径，彻底摆脱 cwd 依赖（见第 9 节）。

---

 5. 架构与请求流程

```
                    ┌──────────────── 主线程 ────────────────┐
                    │  Tcp::Start() → mainReactor->loop()    │
                    │        └── Acceptor(channel)           │
                    │              EPOLLIN → accept4 循环    │
                    └───────────────┬────────────────────────┘
                                    │ Tcp::Connection(fd)
                 fd % subReactors.size() 决定归属
                                    ▼
        ┌──────────── 线程池 N 个线程，各跑一个 EventLoop ────────────┐
        │  subReactor->loop():                                        │
        │     epoll_wait → Channel::Handle()                          │
        │        ├─ EPOLLIN  → Connect::Read()                        │
        │        └─ EPOLLOUT → Connect::Write()                       │
        │     然后执行 delTasks（连接对象在此阶段析构、close(fd)）      │
        └──────────────────────────────────────────────────────────────┘
```

一次请求的完整链路

1. `Acceptor::Connect()` 循环 `accept4(..., SOCK_NONBLOCK)`，每个新 fd 交给 `Tcp::Connection(fd)`
2. `Tcp` 创建 `Connect`（内含 `Socket` / `Channel` / 读缓冲 / 写缓冲），把 channel 注册到 `subReactors[fd % N]` 的 epoll
3. 数据到达 → `Connect::Read()` → `nonBlockRead()` 一次性读到 EAGAIN，全部追加进 `readBuffer`
4. `Connect::extractRequest()` 从 `readBuffer` 中切出一个完整请求头（三态，见第 6 节）
5. 切分成功 → `callback(this)`（即 `server.cpp` 注册的 lambda）→ `GetRequest()` 取出请求 → `HttpRequest::request_response()` 生成响应 → `Connect::Send()`
6. `Send()` 把响应写进 `writeBuffer` 并立即尝试发送；写不完则 `EnableWrite()` 注册 `EPOLLOUT`，后续由 `Connect::Write()` 续写
7. 写缓冲排空 → `shutDown()`：`shutdown(fd, SHUT_WR)` 发 FIN + `Close()`，连接对象在所属 EventLoop 的 `delTasks` 阶段析构并 `close(fd)`

---

 6. 请求解析：三态与两个缓冲区

`Connect::extractRequest()` 返回值语义（`include/connect.h` 的 `RC`）：

| 返回值 | 触发条件 | `Connect::Read()` 的动作 |
| --- | --- | --- |
| `Ok` | 缓冲区里存在完整的 `\r\n\r\n`，且请求行合法 | 调用回调，生成并发送响应 |
| `Wait` | 缓冲区为空，或还没有 `\r\n\r\n`（半包） | 直接 `return`，等下一次 EPOLLIN |
| `Bad` | 只有前导空行 / 请求行畸形（无空格分隔） | 调用回调（此时请求为空或畸形，`request_response` 会回 400）后 `return` |

两个缓冲区的分工

| 容器 | 角色 | 写入 | 清空 |
| --- | --- | --- | --- |
| `readBuffer` | 累积区，跨多次 EPOLLIN 事件保留原始字节 | `nonBlockRead()` 追加 | 仅 `ClearFront(n)`，且只在切出完整请求头之后调用（前导空行除外） |
| `currentRequest` | 交付区，只在解析成功那一刻写入 | `currentRequest.append(a)` | 每次 `extractRequest()` 入口清空；内容在同一轮循环内被回调取走 |

> `extractRequest()` 有副作用（清 `currentRequest`、消费 `readBuffer`），每轮循环只能调用一次

---

 7. HTTP 支持现状

| 方法 | 行为 |
| --- | --- |
| `GET` | 读取 `base + path`，成功 200 + 文件内容，失败 404 |
| `HEAD` | 只回响应头（注意：目前不校验文件是否存在） |
| `POST` / `PUT` / `DELETE` / `OPTIONS` / `PATCH` / `CONNECT` / `TRACE` | 405 Method Not Allowed |
| 未知方法 | 405 |
| 请求行 token < 2 | 400 Bad Request |
| URI 长度 > 1024 | 414 URI Too Long |

- 所有响应都带 `Connection: close`（不支持 keep-alive），响应发完即关闭连接
- Content-Type 由 `map.cpp` 按扩展名映射（html / css / js / png / jpg）
- 状态码文案集中在 `statusCode()`（`error.cpp` 有一份，见第 9 节）

---

 8. 测试与调试

 8.1 curl（推荐）

```bash
curl -i http://127.0.0.1:3000/b.html                       期望 200 + text/html
curl -i http://127.0.0.1:3000/nope.html                    期望 404
curl -i -X POST http://127.0.0.1:3000/b.html               期望 405
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
     http://127.0.0.1:3000/a.html                          大文件完整性（130540 字节）
```

 8.2 nc（精确控制报文）

```bash
 正常请求
printf 'GET /b.html HTTP/1.1\r\nHost: x\r\n\r\n' | nc 127.0.0.1 3000

 半包：分两段发送，中间停 0.5 秒（必须仍是 200）
{ printf 'GET /b.html HTTP/1.1\r\n'; sleep 0.5; printf 'Host: x\r\n\r\n'; } | nc 127.0.0.1 3000

 逐字节慢发（最强半包测试）
printf 'GET /b.html HTTP/1.1\r\nHost: x\r\n\r\n' | \
  while IFS= read -rn1 c; do printf '%s' "$c"; sleep 0.02; done | nc 127.0.0.1 3000

 粘包：两个请求一次发出（响应带 Connection: close，只会回第一个）
printf 'GET /b.html HTTP/1.1\r\nHost: x\r\n\r\nGET /b.html HTTP/1.1\r\nHost: x\r\n\r\n' | nc 127.0.0.1 3000

 畸形 / 空行
printf '\r\n\r\n'               | nc 127.0.0.1 3000      只有空行
printf 'GET\r\n\r\n'            | nc 127.0.0.1 3000      请求行缺空格
printf 'GET / HTTP/1.1\r\n\r\n' | nc 127.0.0.1 3000      无请求头
```

> `-N`（netcat-openbsd）/ `-q 0`（netcat-traditional）/ `--send-only`（ncat）会让 nc 在发完立即半关闭写端，可用来单独验证 EOF 分支（见第 9 节已知问题 1）。

 8.3 服务端日志对照

| 日志 | 含义 |
| --- | --- |
| `数据读取完毕` | 一次 EPOLLIN 已把数据读干净（EAGAIN） |
| `连接已断开！` | 对端关闭 / 发送 FIN（`read() == 0`） |
| `当前收到的是GET请求` | 已进入 GET 分支 |
| `../www/xxx文件打开失败！` | 静态根目录不对或文件不存在（这行会打印它实际尝试打开的路径，排查 cwd 问题最快） |
| `文件读取不完全！` | 目标是目录或读取过程中出错（例如请求 `/`） |
| 400 响应时没有任何日志 | `vec.size()==0` / `head.size()<2` 在打印之前就 return 了 |

---

 9. 已知问题与后续计划

> 已修复：请求被提前清空导致浏览器恒返回 400（`extractRequest()` 被重复调用的副作用）、大响应被提前关闭导致截断。

 P0 — 正确性，优先修

|  | 问题 | 位置 | 现象 / 方向 |
| --- | --- | --- | --- |
| 1 | EOF 抢跑丢请求 | `connect.cpp` `nonBlockRead()` + `Read()` | 对端发完请求立刻半关闭（`nc -N`）时，`read() == 0` 会立即 `Close()` 置 `Closed`，`Read()` 随即 `return`，缓冲区里已收全的请求被丢弃、无任何响应。改法：EOF 只置 `peerClosed` 标志，先把缓冲区的完整请求处理并发送完再关闭 |
| 2 | 无空闲超时 | `event_loop.cpp` / `epoll.cpp` | `Epoll::Poll()` 用默认 `timeout = -1` 永久阻塞，半开连接永不释放。改法：`Poll(1000)` + 每连接时间戳 + 超时回 408 |

 P1 — 健壮性 / 安全

|  | 问题 | 位置 |
| --- | --- | --- |
| 3 | `base` 用相对路径，依赖启动 cwd（见第 4 节） | `httprequest.cpp` |
| 4 | 未剥离 `?query`、未做 URL 解码；无路径穿越防护 | `httprequest.cpp` |
| 5 | 前导 CRLF 无上限 | `connect.cpp` |
| 6 | `errif()` 内部是 `exit(-1)`：`epoll_wait` 被信号打断、`epoll_ctl` 失败都会让整个进程退出 | `error.cpp` / `epoll.cpp` |
| 7 | 无 Host 校验（HTTP/1.1 缺 Host 应回 400） | `httprequest.cpp` |

 P2 — 功能完善

|  | 问题 | 位置 |
| --- | --- | --- |
| 8 | `/` 无 index 映射（`base + "/"` 指向目录）；`www/` 下没有 `index.html`，真正的前端在仓库的 `front/` | `httprequest.cpp` |
| 9 | HEAD 不校验文件存在，缺文件也回 200 + Content-Length: 0 | `httprequest.cpp` |
| 10 | 已有 `www/404.html` 但 404 只回纯文本 | `httprequest.cpp` |
| 11 | 请求头超限静默 `Clear() + Close()`；`statusCode()` 缺 408 / 431 | `connect.cpp` / `httprequest.cpp` |
| 12 | `statusCode` / `buildError` 在 `httprequest.cpp` 与 `error.cpp` 各有一份，且内容不一致 | 两处 |


---

 

 10. 相关文档

| 文档 | 内容 |
| --- | --- |
| `../README.md` | 项目总览 |
| `../docs/后端构建与开发指南.md` | 构建命令清单、目录约定、新增文件/公共库怎么改 CMake、编译错误对照 |
| `../docs/需求文档.md` | 项目需求与里程碑 |
| `../docs/前端接口文档.md` | 前端接口约定 |

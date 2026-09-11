# ============================================================
# 服务器程序
# 当前：TCP Socket 基础（socket / bind / listen / accept）
# 规划（按需求文档里程碑 M1~M2）：
#   epoll 事件循环 + 线程池 + HTTP 解析 + 静态资源 + 日志
#   配置文件解析 + inotify 热更新
# 新增加本程序专属源文件：放进本目录，并在下方 add_executable 里加一行
# ============================================================

add_executable(server
    server.cpp
)

# 公共代码库 common（errif / Socket 等），同时获得 include/ 头文件路径
target_link_libraries(server PRIVATE common)

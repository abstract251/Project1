# ============================================================
# 源码子目录入口
# 每个可执行程序/模块都有自己的 CMakeLists.txt，新增模块时在此登记
# 登记规则：加一行 add_subdirectory(模块目录名)
# ============================================================

# 公共代码库：server / client 等所有可执行程序共用的代码
add_subdirectory(common)

# 服务器程序（后续 http/ threadpool/ logger/ 等模块代码按需拆分子目录）
add_subdirectory(server)

# 联调测试客户端（后续可扩展为压力测试工具）
add_subdirectory(client)

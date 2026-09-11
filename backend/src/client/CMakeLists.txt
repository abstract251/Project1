# ============================================================
# 联调测试客户端（与 server 配合使用）
# 规划：后续可在此新增压力测试工具目标（如 webbench 替代品）
# 新增加本程序专属源文件：放进本目录，并在下方 add_executable 里加一行
# ============================================================

add_executable(client
    client.cpp
)

# 公共代码库 common（errif 等），同时获得 include/ 头文件路径
target_link_libraries(client PRIVATE common)

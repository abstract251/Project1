# ============================================================
# 公共代码库 common
# 所有"多个程序共用"的源文件都放本目录（如 error.cpp / socket.cpp）
# 新增加公共源文件：放进本目录，并在下方 add_library 的列表里加一行
# 使用方（server / client / 未来的 bench）只需一行：
#   target_link_libraries(目标名 PRIVATE common)
# ============================================================

add_library(common STATIC
    error.cpp
    socket.cpp
    epoll.cpp
    channel.cpp
    request_get.cpp
    response_http.cpp
    map.cpp
    requestype.cpp
    server.cpp
    event_loop.cpp
    acceptor.cpp
    connect.cpp
)

# include/ 头文件路径对 common 自身及所有链接它的目标生效（PUBLIC 传播）
target_include_directories(common PUBLIC ${CMAKE_SOURCE_DIR}/include)

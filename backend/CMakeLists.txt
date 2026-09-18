# ============================================================
# 缘遇后端 · 顶层 CMake 配置
# 目标：基于 C++17 的轻量级 Web 服务器 + 配置热更新系统
#
# 构建方式（推荐在 Linux / WSL2 下执行）：
#   cd backend
#   cmake -S . -B build
#   cmake --build build -j
#   产物输出到 backend/bin/
#   运行：./bin/server（先启动服务端） ./bin/client（联调客户端）
# ============================================================

cmake_minimum_required(VERSION 3.16)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

project(LightWebServer
    VERSION 0.1.0
    DESCRIPTION "缘遇后端：轻量级 C++ Web 服务器 + 配置热更新"
    LANGUAGES CXX
)

include_directories(include)

# ---------- C++ 标准 ----------
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# ---------- 输出目录：统一到 backend/bin ----------
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)

# ---------- 默认构建类型 ----------
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug CACHE STRING "构建类型: Debug / Release" FORCE)
endif()

# ---------- 编译选项 ----------
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-Wall -Wextra)
endif()

# ---------- 平台提示 ----------
if(WIN32)
    message(WARNING "本后端依赖 Linux 专有接口（epoll / inotify / sys/socket.h），请在 WSL2 或 Linux 下构建运行")
endif()

# ---------- 源码子目录 ----------
# 模块规划（按需求文档，后续逐步拆分）：
#   server/   服务器程序（将拆分为 net/ http/ threadpool/ logger/ config/ cache/ 等模块）
#   client/   联调测试客户端（后续可扩展为压力测试工具）
add_subdirectory(src)

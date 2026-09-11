#include <vector>
#include <string>
#define MAX 1024
#pragma once
std::vector<std::string> get_line(int socket);        // 把客户端发送的请求+数据按行存储
std::vector<std::string> request_line(std::string a); // 拆分处理请求行信息
std::vector<std::string> request_head(std::string a); // 拆分处理请求头信息
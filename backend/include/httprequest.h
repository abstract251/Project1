#include <memory>
#include <string>
#include <vector>
#pragma once
class HttpRequest {
public:
  HttpRequest();
  std::vector<std::string> request_head(std::string a);
  std::vector<std::string> request_line(std::string a);
  std::string request_response(std::string request);
  std::string response_file(std::string filename);
  std::string response_head(std::string name, int size, int code = 200);
};
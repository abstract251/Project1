#include "httprequest.h"

#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>

#include "connect.h"
#include "map.h"
#define base "../www"
using namespace std;
namespace fs = filesystem;
HttpRequest::HttpRequest() {}
vector<string> HttpRequest::request_head(string a) {
  stringstream ss(a);
  vector<string> vec;
  string line;
  while (getline(ss, line, '\n')) {
    vec.push_back(line);
  }
  return vec;
}
vector<string> HttpRequest::request_line(string a) {
  string line;
  vector<string> head;
  stringstream ss(a);
  while (ss >> line) {
    head.push_back(line);
  }
  return head;
}
string HttpRequest::request_response(string request) {
  vector<string> vec = request_head(request);
  if (vec.size() == 0)
    return buildError(400);
  vector<string> head = request_line(vec[0]);
  if (head.size() < 2)
    return buildError(400);
  if (head[1].size() > 1024)
    return buildError(414);
  if (head[0] == "GET") {
    cout << "当前收到的是GET请求" << endl;
    string file = response_file(head[1]);
    if (file.size() == 0)
      buildError(404);
    string response = response_head(head[1], file.size());
    response = response + file;
    return response;
  } else if (head[0] == "POST") {
    cout << "当前收到的是POST请求" << endl;
  } else if (head[0] == "PUT") {
    cout << "当前收到的是PUT请求" << endl;
  } else if (head[0] == "DELETE") {
    cout << "当前收到的是DELETE请求" << endl;
  } else if (head[0] == "HEAD") {
    cout << "当前收到的是HEAD请求" << endl;
    string file = response_file(head[1]);
    string response = response_head(head[1], file.size());
    return response;
  } else if (head[0] == "OPTIONS") {
    cout << "当前收到的是OPTIONS请求" << endl;
  } else if (head[0] == "PATCH") {
    cout << "当前收到的是PATCH请求" << endl;
  } else if (head[0] == "CONNECT") {
    cout << "当前收到的是CONNECT请求" << endl;
  } else if (head[0] == "TRACE") {
    cout << "当前收到的是TRACE请求" << endl;
  } else {
    cout << "当前收到的是未知类型请求" << endl;
  }
  return buildError(405);
}
string HttpRequest::response_file(string filename) {
  try {
    filename = base + filename;
    ifstream ifs(filename, ios::binary | ios::ate);
    if (!ifs) {
      cerr << filename << "文件打开失败！" << endl;
      return "";
    }
    streamsize a;
    if (ifs.tellg() < 0)
      a = 0;
    else
      a = ifs.tellg();
    ifs.seekg(0, ios::beg);
    string file;
    file.resize(a);
    ifs.read(&file[0], a);
    if (ifs.gcount() < a) {
      cerr << filename << "文件读取不完全！" << endl;
      return "";
    }
    if (!ifs.good()) {
      cerr << filename << "文件读取中出现错误！" << endl;
      return "";
    }
    return file;
  } catch (const exception& e) {
    cerr << "文件读取异常:" << e.what() << endl;
    return "";
  } catch (...) {
    return "";
  }
}
string HttpRequest::response_head(string name, int size, int code) {
  try {
    string head = "HTTP/1.1 ";
    head += statusCode(code);
    head += "\r\nContent-Type: ";
    head += map(get_tail(name));
    head += "\r\nContent-Length: ";
    head += to_string(size);
    head += "\r\nConnection: close\r\n\r\n";
    return head;
  } catch (...) {
    return "HTTP/1.1 500 Internal Server Error\r\nContent-Length: "
           "0\r\nConnection: close\r\n\r\n";
  }
}
string HttpRequest::buildError(int code) {
  string body = statusCode(code);
  string resp = "HTTP/1.1 " + body + "\r\n";
  resp += "Content-Type: text/plain\r\n";
  resp += "Content-Length: " + to_string(body.size()) + "\r\n";
  resp += "Connection: close\r\n\r\n";
  resp += body;
  return resp;
}
string HttpRequest::statusCode(int code) {
  switch (code) {
    case 200:
      return "200 OK";
    case 400:
      return "400 Bad Request";
    case 404:
      return "404 Not Found";
    case 405:
      return "405 Method Not Allowed";
    case 414:
      return "414 URI Too Long";
    default:
      return "500 Internal Server Error";
  }
}
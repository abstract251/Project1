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
    return "";
  vector<string> head = request_line(vec[0]);
  if (head.size() == 0)
    return "";
  if (head[0] == "GET") {
    cout << "当前收到的是GET请求" << endl;
    string file = response_file(head[1]);
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
    string file = response_file(vec[1]);
    string response = response_head(vec[1], file.size());
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
  return "";
}
string HttpRequest::response_file(string filename) {
  filename = base + filename;
  if (!fs::exists(filename)) {
    cout << filename << "文件不存在！" << endl;
    filename = "/404.html";
    filename = base + filename;
  }
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
}
string HttpRequest::response_head(string name, int size) {
  string url = base + name;
  if (!fs::exists(url)) {
    string head = "HTTP/1.1 404 Not Found\r\nContent-Type: ";
    head += map(get_tail(name));
    head += "\r\n\r\n";
    return head;
  }
  string head = "HTTP/1.1 200 OK\r\nContent-Type: ";
  head += map(get_tail(name));
  head += "\r\nContent-Length: ";
  head += to_string(size);
  head += "\r\nConnection: close\r\n\r\n";
  return head;
}
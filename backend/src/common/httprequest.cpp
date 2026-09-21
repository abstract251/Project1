#include "httprequest.h"

#include <fstream>
#include <iostream>

#include "connect.h"
#include "map.h"
using namespace std;
HttpRequest::HttpRequest() {}
vector<string> HttpRequest::request_line(string a) {
  string line;
  for (auto i = 0; i < a.size(); i++) {
    if (a[i] == ' ' || a[i] == '\r' || a[i] == '\n') {
      if (!line.empty()) {
        vec.push_back(line);
        line.clear();
      }
      continue;
    } else
      line.push_back(a[i]);
  }
  return vec;
}
string HttpRequest::request_response(string request) {
  request_line(request);
  if (vec[0] == "GET") {
    cout << "当前收到的是GET请求" << endl;
    string file = response_file(vec[1]);
    string response = response_head(vec[1], file.size());
    response = response + file;
    return response;
  } else if (vec[0] == "POST") {
    cout << "当前收到的是POST请求" << endl;
  } else if (vec[0] == "PUT") {
    cout << "当前收到的是PUT请求" << endl;
  } else if (vec[0] == "DELETE") {
    cout << "当前收到的是DELETE请求" << endl;
  } else if (vec[0] == "HEAD") {
    cout << "当前收到的是HEAD请求" << endl;
    string file = response_file(vec[1]);
    string response = response_head(vec[1], file.size());
    return response;
  } else if (vec[0] == "OPTIONS") {
    cout << "当前收到的是OPTIONS请求" << endl;
  } else if (vec[0] == "PATCH") {
    cout << "当前收到的是PATCH请求" << endl;
  } else if (vec[0] == "CONNECT") {
    cout << "当前收到的是CONNECT请求" << endl;
  } else if (vec[0] == "TRACE") {
    cout << "当前收到的是TRACE请求" << endl;
  } else {
    cout << "当前收到的是未知类型请求" << endl;
  }
  return "";
}
string HttpRequest::response_file(string filename) {
  filename = "../www" + filename;
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
  string head = "HTTP/1.1 200 OK\r\nContent-Type: ";
  head += map(get_tail(name));
  head += "\r\nContent-Length: ";
  head += to_string(size);
  head += "\r\nConnection: close\r\n\r\n";
  return head;
}
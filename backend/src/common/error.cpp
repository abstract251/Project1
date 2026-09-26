#include "error.h"
#include <cstdlib>
#include <iostream>
using namespace std;

void errif(bool condition, const char *message) {
  if (condition) {
    cerr << message << endl;
    exit(ERROR_EXIT);
  }
}
string buildError(int code) {
  string body = statusCode(code);
  string resp = "HTTP/1.1 " + body + "\r\n";
  resp += "Content-Type: text/plain\r\n";
  resp += "Content-Length: " + to_string(body.size()) + "\r\n";
  resp += "Connection: close\r\n\r\n";
  resp += body;
  return resp;
}
string statusCode(int code) {
  switch (code) {
  case 200:
    return "200 OK";
  case 400:
    return "400 Bad Request";
  case 404:
    return "404 Not Found";
  case 405:
    return "405 Method Not Allowed";
  case 408:
    return "408 Request Timeout";
  case 414:
    return "414 URI Too Long";
  case 431:
    return "431 Request Header Fields Too Large";
  default:
    return "500 Internal Server Error";
  }
}
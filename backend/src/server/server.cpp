#include <iostream>

#include "connect.h"
#include "httprequest.h"
#include "tcp.h"
using namespace std;

int main() {
  Tcp t;
  t.Start();
  HttpRequest h;
  t.SetRevc([&h](Connect* con) {
    string a = con->GetRead();
    string line = h.request_response(a);
    int fd = con->Get();
    write(fd, line.c_str(), line.size());
  });
  return 0;
}

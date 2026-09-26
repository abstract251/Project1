#include <iostream>

#include "connect.h"
#include "httprequest.h"
#include "tcp.h"
using namespace std;

int main() {
  Tcp t;
  HttpRequest h;
  t.SetRevc([&h](Connect *con) {
    string a = con->GetRequest();
    string line = h.request_response(a);
    int fd = con->Get();
    con->Send(line);
  });
  t.Start();
  return 0;
}

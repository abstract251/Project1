#include <unistd.h>

#include <cstring>
#include <iostream>

#include "error.h"
#include "socket.h"
#include "thread.h"

using namespace std;

void client(int time = 100, int wait = 0) {
  struct Socket s;
  s.CreateSocket();
  s.Connect();
  sleep(wait);
  int a = 0;
  while (a < time) {
    char buf[1024];
    memset(buf, 0, sizeof(buf));
    string msg = "GET /a.html HTTP/1.1\r\n";
    ssize_t len = write(s.GetSocketfd(), msg.c_str(), msg.size());
    if (len > 0) {
      cout << "客户端fd" << s.GetSocketfd() << "已向服务器发送数据" << buf
           << endl;
    } else if (len == 0) {
      cout << "客户端" << s.GetSocketfd() << "数据发送完毕" << endl;
    } else {
      errif(true, "客户端fd为${s.GetSocketfd()}的数据发送失败了");
      break;
    }
    memset(buf, 0, sizeof(buf));
    ssize_t len2 = read(s.GetSocketfd(), buf, sizeof(buf));
    if (len2 > 0) {
      cout << "客户端" << s.GetSocketfd() << "接收到服务器数据: " << buf
           << endl;
    } else if (len2 == 0) {
      cout << "客户端" << s.GetSocketfd() << "数据读取完毕" << endl;
      break;
    } else {
      cout << "客户端读取失败，errno为" << errno << ":" << strerror(errno)
           << endl;
      close(s.GetSocketfd());
      break;
    }
    a++;
  }
}

int main() {
  Thread a(100);
  function<void()> lambda = []() { client(); };
  for (int i = 0; i < 100; i++) {
    a.AddTasks(lambda);
  }
}
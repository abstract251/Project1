#include "socket.h"

#include <fcntl.h>
#include <unistd.h>

#include <iostream>

#include "error.h"
using namespace std;
Socket::Socket() {
  this->CreateSocket();
}
Socket::Socket(int fd) {
  if (fd < 0)
    cout << "初始化错误，请重新创建socket的值" << endl;
  else
    socketfd = fd;
}
int Socket::CreateSocket() {
  socketfd = socket(AF_INET, SOCK_STREAM, 0);
  errif(socketfd < 0, "socket创建失败");
  int opt = 1;
  errif(setsockopt(socketfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0,
        "设置端口复用失败");
  memset(&sock, 0, sizeof(sock));
  sock.sin_family = AF_INET;
  sock.sin_addr.s_addr = inet_addr("0.0.0.0");
  sock.sin_port = htons(Port);
  return socketfd;
}
int Socket::CreateSocket(const int a, string b) {
  IP = b;
  Port = a;
  socketfd = socket(AF_INET, SOCK_STREAM, 0);
  errif(socketfd < 0, "socket创建失败");
  memset(&sock, 0, sizeof(sock));
  sock.sin_family = AF_INET;
  sock.sin_addr.s_addr = inet_addr(IP.c_str());
  sock.sin_port = htons(Port);
  return socketfd;
}
void Socket::BindSocket() {
  errif(bind(socketfd, (sockaddr*)&sock, sizeof(sock)), "socket绑定失败！");
}
void Socket::Listen() {
  errif(listen(socketfd, SOMAXCONN), "socket监听失败！");
}
int Socket::Accept() {
  memset(&sock1, 0, sizeof(sock1));
  socklen_t len = sizeof(sock1);
  int get_socketfd = accept4(socketfd, (sockaddr*)&sock1, &len, SOCK_NONBLOCK);
  if (get_socketfd < 0) {
    if (errno == EAGAIN || errno == EWOULDBLOCK)
      return -1;
    else
      errif(true, "错了");
  }
  return get_socketfd;
}
bool Socket::Connect() {
  if (connect(socketfd, (sockaddr*)&sock, sizeof(sock)) < 0)
    return false;
  else
    return true;
}
int Socket::GetSocketfd() {
  return socketfd;
}
Socket::~Socket() {
  if (socketfd != -1) {
    close(socketfd);
  }
}
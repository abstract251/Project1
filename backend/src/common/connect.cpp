#include "connect.h"

#include <unistd.h>

#include <iostream>

#include "buffer.h"
#include "channel.h"
#include "event_loop.h"
#include "socket.h"
Connect::Connect(Socket* _socket, EventLoop* loop) {
  state = Invalid;
  readBuffer = new Buffer();
  writeBuffer = new Buffer();
  socket = _socket;
  channel = new Channel(loop, socket->GetSocketfd());
  std::function<void()> lambda = [this]() { this->Read(); };
  channel->SetCallBack(lambda);
  channel->Read();
}

void Connect::SetCallBack(std::function<void()> lambda) {
  callback = lambda;
}

void Connect::Handle() {
  Buffer* buffer = new Buffer();
  while (true) {
    char buf[1024];
    memset(buf, 0, sizeof(buf));
    int n = read(socket->GetSocketfd(), buf, sizeof(buf));
    if (n > 0) {
      buffer->Read(buf, n);
    } else if (n == 0) {
      std::cout << "客户端断开连接" << std::endl;
      delete buffer;
      callback();
      break;
    } else if (n == -1 && errno == EINTR) {
      std::cout << "客户端正常中断，继续读取" << std::endl;
      continue;
    } else if (n == -1 && (errno == EAGAIN || errno == EWOULDBLOCK)) {
      std::cout << "数据读取完毕" << std::endl;
      write(socket->GetSocketfd(), buffer->C_str(), buffer->Size());
      delete buffer;
      break;
    } else {
      std::cout << "未知类型" << std::endl;
      delete buffer;
      break;
    }
  }
}
Connect::~Connect() {
  delete channel;
  delete socket;
  delete readBuffer;
  delete writeBuffer;
}
int Connect::Get() {
  return socket->GetSocketfd();
}
void Connect::Close() {
  close();
}
void Connect::SetClose(std::function<void()> _close) {
  close = _close;
}
void Connect::Read() {
  readBuffer->Clear();
  while (true) {
    char buf[1024];
    memset(buf, 0, sizeof(buf));
    ssize_t n = read(socket->GetSocketfd(), buf, sizeof(buf));
    if (n > 0) {
      readBuffer->Read(buf, n);
    } else if (n == 0) {
      std::cout << "连接已断开！" << std::endl;
      state = Closed;
      break;
    } else if (n == -1 && errno == EINTR) {
      std::cout << "客户端正常中断,继续读取" << std::endl;
      continue;
    } else if (n == -1 && (errno == EWOULDBLOCK || errno == EAGAIN)) {
      std::cout << "数据读取完毕" << std::endl;
      std::string msg = "收到，这是回复！";
      write(socket->GetSocketfd(), msg.c_str(), msg.size());
      break;
    } else {
      std::cout << "出现了其它问题=" << errno << ":" << strerror(errno)
                << std::endl;
      break;
    }
  }
}
void Connect::Write() {}
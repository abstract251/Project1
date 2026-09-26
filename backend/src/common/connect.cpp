#include "connect.h"

#include <unistd.h>

#include <iostream>

#include "buffer.h"
#include "channel.h"
#include "event_loop.h"
#include "socket.h"
Connect::Connect(int fd, EventLoop *loop) {
  state = State::Connected;
  readBuffer = std::make_unique<Buffer>();
  writeBuffer = std::make_unique<Buffer>();
  socket = std::make_unique<Socket>(fd);
  channel = std::make_unique<Channel>(loop, socket->GetSocketfd());
  std::function<void()> lambda1 = [this]() { this->Read(); };
  std::function<void()> lambda2 = [this]() { this->Write(); };
  channel->SetReadCallBack(lambda1);
  channel->SetWriteCallBack(lambda2);
  channel->Read();
}

void Connect::SetCallBack(std::function<void(Connect *)> lambda) {
  callback = lambda;
}
Connect::~Connect() {}
int Connect::Get() { return socket->GetSocketfd(); }
void Connect::Close() {
  if (state == State::Closed)
    return;
  state = State::Closed;
  del(socket->GetSocketfd(), this);
}
void Connect::SetDel(std::function<void(int, Connect *)> _close) {
  del = _close;
}
void Connect::Read() {
  if (state != State::Connected)
    return;
  nonBlockRead();
  if (state == State::Closed)
    return;
  while (state == State::Connected && callback) {
    RC r = extractRequest();
    if (r == RC::Wait)
      return;
    if (r == RC::Bad) {
      callback(this);
      return;
    }
    callback(this);
  }
}
void Connect::nonBlockRead() {
  while (true) {
    char buf[1024];
    memset(buf, 0, sizeof(buf));
    ssize_t n = read(socket->GetSocketfd(), buf, sizeof(buf));
    if (n > 0) {
      readBuffer->Read(buf, n);
    } else if (n == 0) {
      std::cout << "连接已断开！" << std::endl;
      Close();
      break;
    } else if (n == -1 && errno == EINTR) {
      std::cout << "客户端正常中断,继续读取" << std::endl;
      continue;
    } else if (n == -1 && (errno == EWOULDBLOCK || errno == EAGAIN)) {
      std::cout << "数据读取完毕" << std::endl;
      break;
    } else {
      std::cout << "出现了其它问题，errno为" << errno << ":" << strerror(errno)
                << std::endl;
      Close();
      break;
    }
  }
}
void Connect::Write() {
  if (state != State::Connected)
    return;
  nonBlockWrite();
  if (state == State::Closed)
    return;
  if (writeBuffer->Size() > 0)
    channel->EnableWrite();
  else
    shutDown();
}
void Connect::nonBlockWrite() {
  while (writeBuffer->Size() > 0) {
    ssize_t n =
        write(socket->GetSocketfd(), writeBuffer->C_str(), writeBuffer->Size());
    if (n > 0)
      writeBuffer->ClearFront(n);
    else if (n == 0) {
      std::cout << "客户端断开连接" << std::endl;
      Close();
      break;
    } else if (n == -1 && (errno == EAGAIN || errno == EWOULDBLOCK)) {
      std::cout << "数据全部发送完毕" << std::endl;
      break;
    } else if (n == -1 && errno == EINTR) {
      std::cout << "客户端正常中断，继续写" << std::endl;
      continue;
    } else {
      std::cout << "发生其它错误，errno为" << errno << ":" << strerror(errno)
                << std::endl;
      Close();
      break;
    }
  }
}
std::string Connect::GetRead() { return readBuffer->Get(); }
std::string Connect::GetRequest() { return currentRequest; }
void Connect::Send(const std::string &a) {
  if (state != State::Connected)
    return;
  writeBuffer->Read(a);
  Write();
}
void Connect::shutDown() {
  if (state != State::Connected)
    return;
  if (writeBuffer->Size() > 0)
    return;
  int fd = socket->GetSocketfd();
  char buf[1024];
  while (read(fd, buf, sizeof(buf)) > 0) {
  }
  shutdown(fd, SHUT_WR);
  Close();
}
Connect::RC Connect::extractRequest() {
  currentRequest.clear();
  if (readBuffer->Size() <= 0) {
    return RC::Wait;
  }
  std::string data = readBuffer->Get();
  size_t start = 0;
  while (start + 1 < data.size() && data[start] == '\r' &&
         data[start + 1] == '\n')
    start += 2;
  if (start > 0) {
    readBuffer->ClearFront(static_cast<int>(start));
    if (readBuffer->Size() <= 0) {
      return RC::Bad;
    }
    data = readBuffer->Get();
  }
  size_t n = data.find("\r\n\r\n");
  if (n == std::string::npos) {
    return RC::Wait;
  }
  n += 4;
  std::string a;
  a.assign(data, 0, n);
  currentRequest.append(a);
  size_t y = currentRequest.find(' ');
  if (y == 0 || y == std::string::npos || y == n) {
    readBuffer->ClearFront(static_cast<int>(n));
    return RC::Bad;
  }
  readBuffer->ClearFront(static_cast<int>(n));
  return RC::Ok;
}
#include "connect.h"

#include <unistd.h>

#include <iostream>

#include "buffer.h"
#include "channel.h"
#include "event_loop.h"
#include "socket.h"
Connect::Connect(int fd, EventLoop* loop) {
  state = Connected;
  readBuffer = new Buffer();
  writeBuffer = new Buffer();
  socket = new Socket(fd);
  channel = new Channel(loop, socket->GetSocketfd());
  std::function<void()> lambda = [this]() { this->Read(); };
  channel->SetCallBack(lambda);
  channel->Read();
}

void Connect::SetCallBack(std::function<void(Connect*)> lambda) {
  callback = lambda;
}

void Connect::Handle() {
  callback(this);
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
  del(socket->GetSocketfd());
}
void Connect::SetDel(std::function<void(int)> _close) {
  del = _close;
}
void Connect::Read() {
  if (state != Connected)
    return;
  nonBlockRead();
}
void Connect::nonBlockRead() {
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
      Close();
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
      std::cout << "出现了其它问题，errno为" << errno << ":" << strerror(errno)
                << std::endl;
      state = Closed;
      Close();
      break;
    }
  }
}
void Connect::Write() {
  if (state != Connected)
    return;
  nonBlockRead();
}
void Connect::nonBlockWrite() {
  ssize_t size = writeBuffer->Size();
  ssize_t count = 0;
  while (writeBuffer->Size() - count > 0) {
    ssize_t n = write(socket->GetSocketfd(), writeBuffer->C_str(),
                      writeBuffer->Size() - count);
    if (n == 0) {
      std::cout << "客户端断开连接" << std::endl;
      state = Closed;
      Close();
      break;
    } else if (n == -1 && errno == EAGAIN) {
      std::cout << "数据全部发送完毕" << std::endl;
      break;
    } else if (n == -1 && errno == EINTR) {
      std::cout << "客户端正常中断，继续写" << std::endl;
      continue;
    } else {
      std::cout << "发生其它错误，errno为" << errno << ":" << strerror(errno)
                << std::endl;
      state = Closed;
      Close();
      break;
    }
    count += n;
  }
}
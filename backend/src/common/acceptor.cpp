#include "acceptor.h"

#include "channel.h"
#include "event_loop.h"
#include "socket.h"
Acceptor::Acceptor(EventLoop* loop) {
  socket = new Socket();
  socket->BindSocket();
  socket->Listen();
  channel = new Channel(loop, socket->GetSocketfd());
  std::function<void()> lambda = [this]() { this->Connect(); };
  channel->SetCallBack(lambda);
  channel->Read();
}
Acceptor::~Acceptor() {
  delete channel;
  delete socket;
}
void Acceptor::Connect() {
  callback(socket);
}
void Acceptor::SetCallBack(std::function<void(Socket* socket)> lambda) {
  callback = lambda;
}
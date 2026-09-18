#include "server.h"

#include <functional>
#include <iostream>

#include "acceptor.h"
#include "channel.h"
#include "connect.h"
#include "event_loop.h"
#include "socket.h"
#include "thread.h"
Server::Server(EventLoop* loop) {
  mainReactor = loop;
  acceptor = new Acceptor(mainReactor);
  std::function<void(Socket*)> lambda = [this](Socket* socket) {
    this->Connection(socket);
  };
  acceptor->SetCallBack(lambda);
  thread = new Thread();
  int size = thread->GetSize();
  for (int i = 0; i < size; ++i) {
    subReactor.push_back(new EventLoop());
  }
  for (int i = 0; i < size; ++i) {
    std::function<void()> input = [e = subReactor[i]]() { e->loop(); };
    thread->AddTasks(input);
  }
}
Server::~Server() {
  delete acceptor;
  delete mainReactor;
  for (auto p : subReactor) {
    delete p;
  }
  subReactor.clear();
  delete thread;
}
void Server::Connection(Socket* socket) {
  int random = socket->GetSocketfd() % subReactor.size();
  Connect* connect = new Connect(socket, subReactor[random]);
  auto fd = connect->Get();
  std::function<void()> lambda = [this, fd]() { this->DeleteConnect(fd); };
  connect->SetClose(lambda);
  connections[fd] = connect;
}

void Server::DeleteConnect(int socketfd) {
  auto it = connections.find(socketfd);
  if (it != connections.end()) {
    Connect* conn = it->second;
    connections.erase(it);
    delete conn;
  } else {
    std::cout << "Server：" << socketfd << "，该socketfd值不存在，无法删除"
              << std::endl;
  }
}
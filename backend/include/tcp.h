#include <functional>
#include <map>
#include <memory>
#include <vector>
#pragma once
class EventLoop;
class Acceptor;
class Thread;
class Connect;
class Tcp {
 public:
  Tcp();
  ~Tcp();
  void Start();
  void Connection(int socketfd);
  void SetCon(std::function<void(Connect*)> lambda);
  void SetRevc(std::function<void(Connect*)> lambda);
  void Del(int fd);

 private:
  std::unique_ptr<EventLoop> mainReactor;
  std::vector<std::unique_ptr<EventLoop>> subReactors;
  std::unique_ptr<Acceptor> acceptor;
  std::unique_ptr<Thread> _thread;
  std::unordered_map<int, std::unique_ptr<Connect>> connections;
  std::function<void(Connect*)> _con;
  std::function<void(Connect*)> _revc;
};
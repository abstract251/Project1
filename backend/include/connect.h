#pragma once
#include <functional>
#include <memory>
#include <string>
class Socket;
class EventLoop;
class Channel;
class Buffer;
class Connect {
 public:
  enum State { Invalid = 1, Closed, Connected };
  Connect(int fd, EventLoop* loop);
  ~Connect();
  void SetCallBack(std::function<void(Connect*)> lambda);
  void SetDel(std::function<void(int, Connect*)> _close);
  int Get();
  void Close();
  void Read();
  void nonBlockRead();
  void Write();
  void nonBlockWrite();
  std::string GetRead();
  void Send(const std::string& a);

 private:
  std::unique_ptr<Socket> socket;
  std::unique_ptr<Channel> channel;
  std::function<void(Connect*)> callback;
  std::unique_ptr<Buffer> readBuffer;
  std::unique_ptr<Buffer> writeBuffer;
  State state;
  std::function<void(int, Connect*)> del;
};

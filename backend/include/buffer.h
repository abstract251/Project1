#include <string>
class Buffer {
 public:
  void Read(const char* _buf, int size);
  void Read(std::string a);
  void Clear();
  ssize_t Size();
  const char* C_str();
  std::string Get();

 private:
  std::string buf;
};
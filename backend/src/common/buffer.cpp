#include "buffer.h"
void Buffer::Read(const char* _buf, int size) {
  for (int i = 0; i < size; i++) buf.push_back(_buf[i]);
}
void Buffer::Clear() {
  buf.clear();
}
ssize_t Buffer::Size() {
  return buf.size();
}
const char* Buffer::C_str() {
  return buf.c_str();
}
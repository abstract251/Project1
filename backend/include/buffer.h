#include <string>
class Buffer
{
public:
    void Read(const char *_buf, int size);
    void Clear();
    ssize_t Size();
    const char *C_str();

private:
    std::string buf;
};
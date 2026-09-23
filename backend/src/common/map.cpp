#include "map.h"
using namespace std;
string map(string type) {
  string a = "";
  if (type == "html")
    a = "text/html";
  else if (type == "css")
    a = "text/css";
  else if (type == "js")
    a = "text/js";
  else if (type == "png")
    a = "text/png";
  else if (type == "jpg")
    a = "text/jpg";
  return a;
}
string get_tail(string name) {
  auto i = 0;
  while (i < name.size()) {
    if (name[i] == '.' && i < name.size() - 1)
      return name.substr(i + 1, name.size());
    else
      i++;
  }
  return "";
}
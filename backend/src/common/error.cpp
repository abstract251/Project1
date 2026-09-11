#include "error.h"
#include <iostream>
#include <cstdlib>
using namespace std;

void errif(bool condition, const char *message)
{
    if (condition)
    {
        cerr << message << endl;
        exit(ERROR_EXIT);
    }
}
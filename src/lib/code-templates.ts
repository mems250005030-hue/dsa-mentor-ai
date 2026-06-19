import type { Language } from "@prisma/client";

export const languageLabels: Record<Language, string> = {
  CPP: "C++17",
  JAVA: "Java 17",
  PYTHON: "Python 3",
  JAVASCRIPT: "JavaScript"
};

export const monacoLanguages: Record<Language, string> = {
  CPP: "cpp",
  JAVA: "java",
  PYTHON: "python",
  JAVASCRIPT: "javascript"
};

export const starterCode: Record<Language, string> = {
  CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Read from stdin and write the answer to stdout.
    return 0;
}
`,
  JAVA: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Read from stdin and write the answer to stdout.
    }
}
`,
  PYTHON: `import sys

def main():
    data = sys.stdin.read().strip().split()
    # Read from stdin and write the answer to stdout.

if __name__ == "__main__":
    main()
`,
  JAVASCRIPT: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\\s+/);
// Read from stdin and write the answer to stdout.
`
};

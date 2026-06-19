import type { Difficulty } from "@prisma/client";

export type RoadmapTopicSeed = {
  slug: string;
  title: string;
  sortOrder: number;
  description: string;
  theory: string;
  notes: string;
  visualGuide: string;
  commonMistakes: string[];
  prerequisites: string[];
  nextTopics: string[];
  quizzes: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }[];
};

export type ProblemSeed = {
  slug: string;
  title: string;
  topicSlug: string;
  difficulty: Difficulty;
  tags: string[];
  statement: string;
  constraints: string[];
  examples: { input: string; output: string; explanation: string }[];
  hiddenTestCases: { input: string; expectedOutput: string }[];
  expectedComplexity: string;
  hints: string[];
  editorial: string;
};

const topicBlueprints = [
  ["arrays", "Arrays", "indexing, prefix sums, two pointers, sliding windows"],
  ["strings", "Strings", "character frequency, pattern scans, normalization"],
  ["recursion", "Recursion", "base cases, call stacks, divide-and-conquer thinking"],
  ["sorting", "Sorting", "comparison keys, stability, custom ordering"],
  ["searching", "Searching", "binary search, monotonic predicates, bounds"],
  ["linked-lists", "Linked Lists", "pointers, sentinels, reversal, cycle reasoning"],
  ["stacks", "Stacks", "LIFO state, matching, monotonic stacks"],
  ["queues", "Queues", "FIFO processing, breadth-first simulation, windows"],
  ["trees", "Trees", "DFS, BFS, recursion over parent-child structure"],
  ["bst", "BST", "ordered tree invariants, lower/upper bounds"],
  ["heaps", "Heaps", "priority queues, top-k, online ordering"],
  ["hashing", "Hashing", "constant-time lookup, counting, signatures"],
  ["greedy", "Greedy", "local choices, exchange arguments, intervals"],
  ["graphs", "Graphs", "adjacency, traversal, shortest paths, components"],
  ["backtracking", "Backtracking", "search spaces, pruning, undo steps"],
  ["dynamic-programming", "Dynamic Programming", "state, transition, memoization, tabulation"],
  ["bit-manipulation", "Bit Manipulation", "masks, XOR, shifts, bit sets"]
] as const;

export const roadmapTopics: RoadmapTopicSeed[] = topicBlueprints.map(([slug, title, focus], index) => {
  const previous = index > 0 ? [topicBlueprints[index - 1][0]] : [];
  const next = topicBlueprints[index + 1] ? [topicBlueprints[index + 1][0]] : [];

  return {
    slug,
    title,
    sortOrder: index + 1,
    description: `Master ${title.toLowerCase()} through ${focus}.`,
    theory:
      `${title} problems reward clear state definitions. Start by naming the input shape, the operation allowed on each step, and the invariant that must remain true. ` +
      `Beginner solutions usually simulate the process directly. Intermediate solutions reduce repeated work with a reusable structure such as a prefix table, stack, heap, map, or recurrence. ` +
      `Advanced solutions identify a monotonic property, compressed state, or proof that a locally optimal choice is globally valid.`,
    notes:
      `Core focus: ${focus}. Track input size before choosing an approach. Write the brute-force version mentally, then ask what information is recomputed. ` +
      `For each solution, record the invariant, time complexity, memory complexity, and the edge case that would break a casual implementation.`,
    visualGuide:
      `Visualize ${title.toLowerCase()} by drawing the state after every operation. Use arrows for moving pointers, columns for frequencies, layers for BFS, and a table for dynamic states. ` +
      `When a value changes, mark exactly which earlier value justified the change; this makes the proof visible instead of hidden in code.`,
    commonMistakes: [
      "Skipping empty input and single-element cases.",
      "Updating the answer before the invariant is restored.",
      "Using the right data structure but storing too little state to recover the final answer.",
      "Quoting complexity without counting nested work hidden inside helper calls."
    ],
    prerequisites: previous,
    nextTopics: next,
    quizzes: [
      {
        question: `What should you define first when solving a ${title} problem?`,
        options: ["The invariant and state", "The final variable name", "The programming language", "The fastest library function"],
        answer: "The invariant and state",
        explanation: "A named invariant tells you what must stay true after each operation and prevents accidental case-by-case code."
      },
      {
        question: `Which review habit improves ${title} solutions most reliably?`,
        options: ["Trace a tiny example and a boundary example", "Only test the sample", "Remove all helper functions", "Always sort the input"],
        answer: "Trace a tiny example and a boundary example",
        explanation: "Tiny and boundary traces expose off-by-one errors, invalid base cases, and missing state transitions."
      }
    ]
  };
});

export const starterProblems: ProblemSeed[] = [
  {
    slug: "stable-hill-count",
    title: "Stable Hill Count",
    topicSlug: "arrays",
    difficulty: "EASY",
    tags: ["arrays", "scan"],
    statement: "Given an integer array, count positions that are strictly greater than both immediate neighbors. The first and last positions cannot be hills.",
    constraints: ["1 <= n <= 200000", "-10^9 <= nums[i] <= 10^9"],
    examples: [
      { input: "6\n1 3 2 4 4 1", output: "1", explanation: "Only value 3 is greater than both neighbors." },
      { input: "5\n5 1 5 1 5", output: "1", explanation: "The middle 5 is a hill; endpoints do not count." }
    ],
    hiddenTestCases: [
      { input: "1\n9", expectedOutput: "0" },
      { input: "7\n2 5 1 6 2 8 7", expectedOutput: "3" },
      { input: "4\n4 4 4 4", expectedOutput: "0" }
    ],
    expectedComplexity: "O(n) time, O(1) extra space",
    hints: ["Endpoints never count.", "A single pass is enough because each decision uses only two neighbors."],
    editorial: "Scan indices 1 through n - 2 and increment the answer when nums[i] is strictly larger than nums[i - 1] and nums[i + 1]."
  },
  {
    slug: "balanced-vowel-windows",
    title: "Balanced Vowel Windows",
    topicSlug: "strings",
    difficulty: "MEDIUM",
    tags: ["strings", "sliding-window"],
    statement: "Given a lowercase string s and window length k, count windows of length k where the number of vowels equals the number of consonants.",
    constraints: ["1 <= k <= |s| <= 200000", "s contains lowercase English letters"],
    examples: [
      { input: "abeci\n4", output: "2", explanation: "abec and beci each contain two vowels and two consonants." },
      { input: "leetcode\n3", output: "0", explanation: "No length-3 window has equal counts." }
    ],
    hiddenTestCases: [
      { input: "aaaa\n2", expectedOutput: "0" },
      { input: "ababab\n2", expectedOutput: "5" },
      { input: "coding\n6", expectedOutput: "1" }
    ],
    expectedComplexity: "O(n) time, O(1) extra space",
    hints: ["A balanced window must have even k.", "Maintain the vowel count while sliding one character at a time."],
    editorial: "Use a helper isVowel. Count vowels in the first k characters, then slide the window by subtracting the outgoing character and adding the incoming character. A window is balanced when vowels * 2 == k."
  },
  {
    slug: "recursive-spark-sum",
    title: "Recursive Spark Sum",
    topicSlug: "recursion",
    difficulty: "EASY",
    tags: ["recursion", "math"],
    statement: "Repeatedly replace a positive integer with the sum of squares of its digits until it has one digit. Output the final digit.",
    constraints: ["1 <= n <= 10^18"],
    examples: [
      { input: "19", output: "1", explanation: "19 -> 82 -> 68 -> 100 -> 1." },
      { input: "77", output: "4", explanation: "77 -> 98 -> 145 -> 42 -> 20 -> 4, then 4 is one digit." }
    ],
    hiddenTestCases: [
      { input: "1", expectedOutput: "1" },
      { input: "999999999999", expectedOutput: "9" },
      { input: "12345", expectedOutput: "2" }
    ],
    expectedComplexity: "O(d * steps) time, O(steps) call stack for a recursive implementation",
    hints: ["The base case is n < 10.", "Write a helper that computes the sum of squared digits."],
    editorial: "If n is one digit, return n. Otherwise compute the sum of squared digits and recursively solve that smaller value. The value quickly shrinks because digit-square sums are bounded."
  },
  {
    slug: "last-digit-rank",
    title: "Last Digit Rank",
    topicSlug: "sorting",
    difficulty: "EASY",
    tags: ["sorting", "custom-comparator"],
    statement: "Sort integers by their last decimal digit in ascending order. Ties are resolved by the full integer value. Output the sorted list.",
    constraints: ["1 <= n <= 200000", "0 <= nums[i] <= 10^9"],
    examples: [
      { input: "5\n31 22 13 40 5", output: "40 31 22 13 5", explanation: "Last digits are 0, 1, 2, 3, 5." }
    ],
    hiddenTestCases: [
      { input: "4\n19 9 29 1", expectedOutput: "1 9 19 29" },
      { input: "3\n10 20 30", expectedOutput: "10 20 30" }
    ],
    expectedComplexity: "O(n log n) time, O(n) or O(log n) space depending on language sort",
    hints: ["Compare a % 10 first.", "Use the full value only when last digits match."],
    editorial: "Apply a comparator or key pair (num % 10, num). This keeps the sorting rule explicit and avoids manual bucket mistakes."
  },
  {
    slug: "first-capacity-day",
    title: "First Capacity Day",
    topicSlug: "searching",
    difficulty: "EASY",
    tags: ["binary-search", "lower-bound"],
    statement: "Given a nondecreasing list of daily capacities and a required target, output the first 0-based day index whose capacity is at least target, or -1 if none exists.",
    constraints: ["1 <= n <= 200000", "capacities are nondecreasing"],
    examples: [
      { input: "5 7\n1 3 7 7 10", output: "2", explanation: "Day index 2 is the first capacity >= 7." }
    ],
    hiddenTestCases: [
      { input: "4 6\n1 2 3 4", expectedOutput: "-1" },
      { input: "3 1\n1 1 1", expectedOutput: "0" }
    ],
    expectedComplexity: "O(log n) time, O(1) extra space",
    hints: ["This is a lower-bound search.", "When mid satisfies the condition, keep searching left."],
    editorial: "Binary search the first index with capacity >= target. Store an answer candidate whenever the condition is true and move the right boundary left."
  },
  {
    slug: "pairwise-list-reversal",
    title: "Pairwise List Reversal",
    topicSlug: "linked-lists",
    difficulty: "MEDIUM",
    tags: ["linked-list", "pointers"],
    statement: "A linked list is provided as an array. Reverse every consecutive pair of nodes and output the resulting values. The final unpaired node remains in place.",
    constraints: ["0 <= n <= 200000", "-10^9 <= value <= 10^9"],
    examples: [
      { input: "5\n1 2 3 4 5", output: "2 1 4 3 5", explanation: "Pairs (1,2) and (3,4) are reversed." }
    ],
    hiddenTestCases: [
      { input: "0\n", expectedOutput: "" },
      { input: "2\n8 9", expectedOutput: "9 8" },
      { input: "3\n7 6 5", expectedOutput: "6 7 5" }
    ],
    expectedComplexity: "O(n) time, O(1) pointer space for an actual linked list",
    hints: ["Use a dummy node when implementing with links.", "Keep the node after the pair before rewiring."],
    editorial: "With linked nodes, maintain prev, first, second, and nextGroup. Rewire prev.next to second, second.next to first, and first.next to nextGroup, then advance prev to first."
  },
  {
    slug: "dual-backspace-signals",
    title: "Dual Backspace Signals",
    topicSlug: "stacks",
    difficulty: "EASY",
    tags: ["stack", "strings"],
    statement: "Two signal strings use # as a backspace. Output true if both strings are equal after processing all backspaces, otherwise false.",
    constraints: ["1 <= |s|, |t| <= 200000"],
    examples: [
      { input: "ab#c\nad#c", output: "true", explanation: "Both become ac." },
      { input: "a#c\nb", output: "false", explanation: "The processed strings are c and b." }
    ],
    hiddenTestCases: [
      { input: "####\n#", expectedOutput: "true" },
      { input: "xy##z\nz", expectedOutput: "true" }
    ],
    expectedComplexity: "O(n + m) time, O(n + m) stack space",
    hints: ["Push letters and pop on # when possible.", "An empty stack stays empty when # appears."],
    editorial: "Process each string with a stack. For a normal character, push it. For #, pop if the stack is not empty. Compare the final strings."
  },
  {
    slug: "rotating-printer-time",
    title: "Rotating Printer Time",
    topicSlug: "queues",
    difficulty: "MEDIUM",
    tags: ["queue", "simulation"],
    statement: "A printer queue contains jobs with priorities. Each minute, the first job prints if no job has a higher priority; otherwise it moves to the back. Given the target job index, output the minute when it prints.",
    constraints: ["1 <= n <= 2000", "1 <= priority <= 9"],
    examples: [
      { input: "4 2\n2 1 3 2", output: "1", explanation: "The target priority 3 prints first." },
      { input: "3 0\n1 1 9", output: "3", explanation: "The first job waits until the 9 prints." }
    ],
    hiddenTestCases: [
      { input: "1 0\n5", expectedOutput: "1" },
      { input: "5 4\n2 3 2 3 2", expectedOutput: "5" }
    ],
    expectedComplexity: "O(n * p) with priority counts, where p <= 9",
    hints: ["Store each job with its original index.", "Priority counts let you check if a higher priority remains."],
    editorial: "Use a FIFO queue of (priority, index). Maintain counts for priorities 1..9. A job prints when all higher-priority counts are zero; otherwise push it back."
  },
  {
    slug: "even-root-paths",
    title: "Even Root Paths",
    topicSlug: "trees",
    difficulty: "MEDIUM",
    tags: ["tree", "dfs"],
    statement: "A binary tree is given in level-order using null for missing nodes. Count root-to-leaf paths whose sum is even.",
    constraints: ["0 <= nodes <= 200000", "-10^6 <= value <= 10^6"],
    examples: [
      { input: "7\n1 2 3 null null 4 5", output: "1", explanation: "Path 1->3->4 has even sum." }
    ],
    hiddenTestCases: [
      { input: "0\n", expectedOutput: "0" },
      { input: "3\n2 1 4", expectedOutput: "1" },
      { input: "1\n8", expectedOutput: "1" }
    ],
    expectedComplexity: "O(n) time, O(h) recursion stack",
    hints: ["Track the running sum while traversing.", "A leaf has no left or right child."],
    editorial: "Build child indices from level order or traverse the array representation carefully. DFS from the root with a running sum and count leaves where sum % 2 == 0."
  },
  {
    slug: "closest-bst-signal",
    title: "Closest BST Signal",
    topicSlug: "bst",
    difficulty: "MEDIUM",
    tags: ["bst", "search"],
    statement: "A BST is given in level-order using null for missing nodes, followed by a target integer. Output the tree value closest to the target. If tied, output the smaller value.",
    constraints: ["1 <= nodes <= 200000", "-10^9 <= values,target <= 10^9"],
    examples: [
      { input: "5\n8 3 10 1 6\n7", output: "6", explanation: "8 and 6 are both distance 1 from the target, so the smaller value 6 wins the tie." }
    ],
    hiddenTestCases: [
      { input: "3\n5 2 9\n8", expectedOutput: "9" },
      { input: "1\n4\n10", expectedOutput: "4" },
      { input: "5\n8 3 10 1 6\n7", expectedOutput: "6" }
    ],
    expectedComplexity: "O(h) time on a valid BST, O(1) extra space iteratively",
    hints: ["Use the BST ordering to move left or right.", "Update the best value before moving."],
    editorial: "Start at root. At each node, compare its distance to the best value so far, breaking ties toward smaller values. Move left if target is smaller than node value, otherwise right."
  },
  {
    slug: "prefix-kth-smallest",
    title: "Prefix Kth Smallest",
    topicSlug: "heaps",
    difficulty: "MEDIUM",
    tags: ["heap", "stream"],
    statement: "Given a stream of n integers and k, output the kth smallest value after each prefix. Output NA until the prefix has at least k values.",
    constraints: ["1 <= k <= n <= 200000", "-10^9 <= value <= 10^9"],
    examples: [
      { input: "5 3\n5 1 4 2 3", output: "NA NA 5 4 3", explanation: "The kth smallest after prefixes 3, 4, 5 is 5, 4, 3." }
    ],
    hiddenTestCases: [
      { input: "3 1\n9 8 7", expectedOutput: "9 8 7" },
      { input: "4 2\n1 2 3 4", expectedOutput: "NA 2 2 2" }
    ],
    expectedComplexity: "O(n log k) time, O(k) space",
    hints: ["Keep the k smallest elements seen so far.", "A max-heap of size k exposes the kth smallest at the root."],
    editorial: "Maintain a max-heap of at most k elements. Push each value; if heap size exceeds k, remove the largest. Once size is k, the heap maximum is the kth smallest."
  },
  {
    slug: "balanced-label-span",
    title: "Balanced Label Span",
    topicSlug: "hashing",
    difficulty: "MEDIUM",
    tags: ["hash-map", "prefix"],
    statement: "Given a string containing only A and B, return the length of the longest contiguous span with the same number of A and B labels.",
    constraints: ["1 <= |s| <= 200000"],
    examples: [
      { input: "AABABB", output: "6", explanation: "The whole string has three A and three B." }
    ],
    hiddenTestCases: [
      { input: "AAAA", expectedOutput: "0" },
      { input: "ABBAA", expectedOutput: "4" },
      { input: "BABA", expectedOutput: "4" }
    ],
    expectedComplexity: "O(n) time, O(n) space",
    hints: ["Treat A as +1 and B as -1.", "The same prefix balance seen twice means the middle span balances."],
    editorial: "Track the earliest index for each balance value. Whenever a balance repeats, update the answer with the distance to the earliest occurrence."
  },
  {
    slug: "interval-token-cover",
    title: "Interval Token Cover",
    topicSlug: "greedy",
    difficulty: "MEDIUM",
    tags: ["greedy", "intervals"],
    statement: "Given intervals on a number line, choose the minimum number of points so every interval contains at least one chosen point.",
    constraints: ["1 <= n <= 200000", "-10^9 <= l <= r <= 10^9"],
    examples: [
      { input: "3\n1 3\n2 5\n6 8", output: "2", explanation: "Choose points 3 and 8." }
    ],
    hiddenTestCases: [
      { input: "2\n1 2\n3 4", expectedOutput: "2" },
      { input: "3\n1 10\n2 3\n4 5", expectedOutput: "2" }
    ],
    expectedComplexity: "O(n log n) time, O(1) extra space after sorting",
    hints: ["Sort by interval end.", "When an interval is uncovered, choose its end."],
    editorial: "Sort intervals by right endpoint. Keep the last chosen point. If the current interval starts after that point, choose its right endpoint and increment the answer."
  },
  {
    slug: "component-signal-count",
    title: "Component Signal Count",
    topicSlug: "graphs",
    difficulty: "MEDIUM",
    tags: ["graph", "dfs", "grid"],
    statement: "Given an n by m grid of 0 and 1, count connected components of 1-cells using 4-directional movement.",
    constraints: ["1 <= n,m <= 1000", "n*m <= 200000"],
    examples: [
      { input: "3 4\n1100\n0101\n0011", output: "2", explanation: "There are two 4-connected groups of 1-cells." }
    ],
    hiddenTestCases: [
      { input: "1 5\n00000", expectedOutput: "0" },
      { input: "2 2\n10\n01", expectedOutput: "2" },
      { input: "2 3\n111\n111", expectedOutput: "1" }
    ],
    expectedComplexity: "O(n*m) time, O(n*m) visited space",
    hints: ["Start a traversal only from an unvisited 1-cell.", "Mark cells as visited before pushing neighbors."],
    editorial: "Iterate over all cells. When an unvisited 1 is found, increment components and run DFS or BFS over valid 4-neighbors."
  },
  {
    slug: "quiet-colorings",
    title: "Quiet Colorings",
    topicSlug: "backtracking",
    difficulty: "MEDIUM",
    tags: ["backtracking", "counting"],
    statement: "Count the number of ways to color n positions with c colors such that adjacent positions never have the same color. Output the count modulo 1,000,000,007.",
    constraints: ["1 <= n <= 100000", "1 <= c <= 100000"],
    examples: [
      { input: "3 2", output: "2", explanation: "ABA and BAB." }
    ],
    hiddenTestCases: [
      { input: "1 5", expectedOutput: "5" },
      { input: "2 1", expectedOutput: "0" },
      { input: "4 3", expectedOutput: "24" }
    ],
    expectedComplexity: "O(n) time, O(1) space after deriving the recurrence",
    hints: ["Backtracking reveals the transition.", "The first position has c choices; each later position has c - 1 choices."],
    editorial: "A direct backtracking tree has c choices at depth 1 and c - 1 choices afterward. Compute c * (c - 1)^(n - 1) modulo MOD."
  },
  {
    slug: "broken-step-routes",
    title: "Broken Step Routes",
    topicSlug: "dynamic-programming",
    difficulty: "MEDIUM",
    tags: ["dp", "tabulation"],
    statement: "You can climb 1 or 2 steps at a time from step 0 to step n. Some steps are broken and cannot be landed on. Count valid routes modulo 1,000,000,007.",
    constraints: ["1 <= n <= 200000", "0 <= brokenCount <= n"],
    examples: [
      { input: "5 1\n3", output: "2", explanation: "Routes avoid step 3." }
    ],
    hiddenTestCases: [
      { input: "2 0\n", expectedOutput: "2" },
      { input: "4 2\n1 2", expectedOutput: "0" },
      { input: "6 1\n4", expectedOutput: "4" }
    ],
    expectedComplexity: "O(n) time, O(n) or O(1) space",
    hints: ["dp[i] depends on dp[i - 1] and dp[i - 2].", "If a step is broken, dp[i] is 0."],
    editorial: "Let dp[0] = 1. For i from 1 to n, set dp[i] = 0 when broken; otherwise add dp[i - 1] and dp[i - 2] when those indices exist."
  },
  {
    slug: "two-lonely-xors",
    title: "Two Lonely XORs",
    topicSlug: "bit-manipulation",
    difficulty: "MEDIUM",
    tags: ["xor", "bits"],
    statement: "In an array, exactly two values appear once and every other value appears exactly twice. Output the two unique values in ascending order.",
    constraints: ["2 <= n <= 200000", "n is even", "0 <= value <= 10^9"],
    examples: [
      { input: "6\n4 1 2 1 2 7", output: "4 7", explanation: "4 and 7 appear once." }
    ],
    hiddenTestCases: [
      { input: "2\n9 3", expectedOutput: "3 9" },
      { input: "8\n5 6 5 7 8 6 9 8", expectedOutput: "7 9" }
    ],
    expectedComplexity: "O(n) time, O(1) extra space",
    hints: ["XOR of all values equals a ^ b for the two lonely values.", "Use a set bit of a ^ b to split values into two groups."],
    editorial: "Compute xorAll. Isolate any set bit, such as xorAll & -xorAll. XOR values with that bit separately from values without it; duplicates cancel, leaving the two unique values."
  }
];

export const achievements = [
  {
    slug: "first-accepted",
    name: "First Accepted",
    description: "Solve your first problem.",
    type: "SOLVED" as const,
    xpReward: 50,
    unlockCondition: { solvedProblems: 1 }
  },
  {
    slug: "week-streak",
    name: "Seven-Day Builder",
    description: "Practice for seven days in a row.",
    type: "STREAK" as const,
    xpReward: 150,
    unlockCondition: { streak: 7 }
  },
  {
    slug: "topic-finisher",
    name: "Topic Finisher",
    description: "Reach 100% completion on any topic.",
    type: "TOPIC" as const,
    xpReward: 200,
    unlockCondition: { topicCompletion: 100 }
  },
  {
    slug: "contest-starter",
    name: "Contest Starter",
    description: "Join your first contest.",
    type: "CONTEST" as const,
    xpReward: 75,
    unlockCondition: { contests: 1 }
  },
  {
    slug: "level-five",
    name: "Level Five",
    description: "Earn enough XP to reach level five.",
    type: "XP" as const,
    xpReward: 250,
    unlockCondition: { level: 5 }
  }
];

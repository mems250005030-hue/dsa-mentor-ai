import { Prisma, type ContestStatus, type Difficulty, type PrismaClient } from "@prisma/client";
import { addDays, addHours, startOfDay } from "date-fns";

type TopicSeed = {
  slug: string;
  title: string;
  description: string;
  focus: string;
  techniques: string[];
};

type ProblemIdea = {
  title: string;
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

const topics: TopicSeed[] = [
  {
    slug: "arrays",
    title: "Arrays",
    description: "Indexing, prefix sums, difference arrays, rotations, and in-place updates.",
    focus: "Use positional access and compact state to scan, update, and aggregate linear data.",
    techniques: ["prefix sums", "difference array", "in-place marking", "frequency buckets"]
  },
  {
    slug: "strings",
    title: "Strings",
    description: "Character scans, normalization, anagrams, parsing, and pattern matching.",
    focus: "Treat text as structured data by tracking counts, windows, and reusable signatures.",
    techniques: ["frequency arrays", "rolling comparison", "token parsing", "case normalization"]
  },
  {
    slug: "linked-list",
    title: "Linked List",
    description: "Pointer rewiring, sentinels, cycle detection, merges, and reversals.",
    focus: "Control node references carefully so every mutation preserves list reachability.",
    techniques: ["dummy nodes", "fast and slow pointers", "iterative reversal", "merge pointers"]
  },
  {
    slug: "stack",
    title: "Stack",
    description: "LIFO state, expression parsing, monotonic stacks, and undo-style workflows.",
    focus: "Use the top of the stack as the only active unresolved state.",
    techniques: ["balanced symbols", "monotonic stack", "span calculation", "expression evaluation"]
  },
  {
    slug: "queue",
    title: "Queue",
    description: "FIFO processing, simulations, level traversal, and producer-consumer flows.",
    focus: "Preserve arrival order while processing one frontier or event at a time.",
    techniques: ["BFS queue", "simulation", "circular buffer", "multi-source queue"]
  },
  {
    slug: "recursion",
    title: "Recursion",
    description: "Base cases, call stacks, divide and conquer, and recursive generation.",
    focus: "Define the smallest solved case and reduce every larger case toward it.",
    techniques: ["base cases", "call tree tracing", "divide and conquer", "recursive decomposition"]
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    description: "Lower bounds, upper bounds, answer search, and monotonic predicates.",
    focus: "Exploit sorted order or monotonic feasibility to cut the search space in half.",
    techniques: ["lower bound", "upper bound", "binary search on answer", "predicate design"]
  },
  {
    slug: "trees",
    title: "Trees",
    description: "DFS, BFS, path sums, diameter, depth, and rooted tree reasoning.",
    focus: "Solve each node from information collected from children, parents, or levels.",
    techniques: ["recursive DFS", "iterative BFS", "path tracking", "postorder aggregation"]
  },
  {
    slug: "bst",
    title: "BST",
    description: "Ordered tree invariants, validation, search, insertion, and kth queries.",
    focus: "Use lower and upper bounds to preserve the sorted invariant at every node.",
    techniques: ["inorder traversal", "range bounds", "successor search", "kth smallest"]
  },
  {
    slug: "heap",
    title: "Heap",
    description: "Priority queues, top-k queries, streaming medians, and scheduling.",
    focus: "Keep the next best candidate available without fully sorting the input.",
    techniques: ["min heap", "max heap", "two heaps", "lazy deletion"]
  },
  {
    slug: "graph",
    title: "Graph",
    description: "Adjacency lists, traversal, components, shortest paths, and topological order.",
    focus: "Model relationships explicitly and choose traversal based on edge semantics.",
    techniques: ["DFS", "BFS", "Dijkstra", "topological sort"]
  },
  {
    slug: "dp",
    title: "DP",
    description: "State definitions, transitions, memoization, tabulation, and optimization.",
    focus: "Turn repeated subproblems into stored states with clear transitions.",
    techniques: ["memoization", "tabulation", "1D optimization", "knapsack states"]
  },
  {
    slug: "greedy",
    title: "Greedy",
    description: "Local choices, exchange arguments, intervals, and scheduling.",
    focus: "Choose the next locally optimal action only when a proof makes it irreversible.",
    techniques: ["sorting by end", "exchange proof", "priority selection", "interval sweep"]
  },
  {
    slug: "trie",
    title: "Trie",
    description: "Prefix trees, autocomplete, dictionary lookup, and bitwise tries.",
    focus: "Share common prefixes to answer word and prefix queries efficiently.",
    techniques: ["prefix insertion", "terminal markers", "compressed paths", "binary trie"]
  },
  {
    slug: "segment-tree",
    title: "Segment Tree",
    description: "Range queries, point updates, lazy propagation, and interval aggregation.",
    focus: "Split ranges into reusable segments so updates and queries stay logarithmic.",
    techniques: ["build tree", "range query", "point update", "lazy propagation"]
  },
  {
    slug: "backtracking",
    title: "Backtracking",
    description: "Search spaces, permutations, combinations, constraints, and pruning.",
    focus: "Explore choices depth-first while undoing state precisely after each branch.",
    techniques: ["choose-explore-unchoose", "constraint pruning", "bitmask choices", "candidate ordering"]
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    description: "Fixed and variable windows, frequency constraints, and streaming scans.",
    focus: "Maintain an answer over a moving contiguous range without recomputing it.",
    techniques: ["fixed window", "variable window", "frequency map", "two-boundary invariant"]
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    description: "Opposite-end scans, partitioning, merging, and slow-fast movement.",
    focus: "Move two indices with a reasoned invariant to avoid nested loops.",
    techniques: ["opposite pointers", "same-direction pointers", "partitioning", "merge scan"]
  },
  {
    slug: "bit-manipulation",
    title: "Bit Manipulation",
    description: "Masks, XOR, shifts, subsets, and compact boolean state.",
    focus: "Represent sets and parity directly in bits for fast state transitions.",
    techniques: ["XOR cancellation", "bit masks", "set bits", "subset enumeration"]
  },
  {
    slug: "union-find",
    title: "Union Find",
    description: "Disjoint sets, connectivity, cycle checks, and component aggregation.",
    focus: "Track dynamic connectivity with parent compression and rank or size.",
    techniques: ["path compression", "union by size", "cycle detection", "component counting"]
  }
];

const problemIdeasByTopic: Record<string, ProblemIdea[]> = {
  arrays: [
    idea("Balanced Prefix Index", "EASY", ["array", "prefix-sum"], "Given an array, return the first index where the sum on the left equals the sum on the right.", ["1 <= n <= 200000", "-10^9 <= nums[i] <= 10^9"], "O(n) time, O(1) space"),
    idea("Range Addition Queries", "MEDIUM", ["array", "difference-array"], "Apply q inclusive range increments to an initially zero array and output the final values.", ["1 <= n,q <= 200000", "-10^5 <= delta <= 10^5"], "O(n + q) time, O(n) space"),
    idea("Mountain Triplets", "MEDIUM", ["array", "scan"], "Count positions that are greater than both neighbors and belong to a strictly increasing then decreasing triplet.", ["3 <= n <= 200000"], "O(n) time, O(1) space"),
    idea("Minimum Rotation Score", "HARD", ["array", "rotation"], "Find the rotation with the maximum score where nums[i] <= i after rotation.", ["1 <= n <= 200000"], "O(n) time, O(n) space"),
    idea("Compact Missing Positive", "HARD", ["array", "in-place"], "Return the smallest missing positive integer using the input array as storage.", ["1 <= n <= 200000"], "O(n) time, O(1) space")
  ],
  strings: [
    idea("First Unique Character", "EASY", ["string", "frequency"], "Return the index of the first character that appears exactly once, or -1.", ["1 <= |s| <= 200000"], "O(n) time, O(1) space"),
    idea("Grouped Anagram Signature", "MEDIUM", ["string", "hashing"], "Group words that are anagrams using a deterministic signature.", ["1 <= words.length <= 20000"], "O(total characters) time"),
    idea("Decode Run Length Text", "MEDIUM", ["string", "parsing"], "Decode a string containing counts followed by lowercase blocks.", ["1 <= |s| <= 200000"], "O(n + output) time"),
    idea("Shortest Palindrome Patch", "HARD", ["string", "kmp"], "Add the fewest characters to the front so the whole string becomes a palindrome.", ["1 <= |s| <= 200000"], "O(n) time"),
    idea("Wildcard Token Match", "HARD", ["string", "dp"], "Determine whether a pattern with ? and * matches the full text.", ["1 <= |text|, |pattern| <= 2000"], "O(nm) time")
  ],
  "linked-list": [
    idea("Reverse Linked List", "EASY", ["linked-list", "pointers"], "Reverse a singly linked list and output the resulting order.", ["0 <= n <= 200000"], "O(n) time, O(1) space"),
    idea("Remove Nth From End", "MEDIUM", ["linked-list", "two-pointers"], "Remove the nth node from the end using a single pass.", ["1 <= n <= length <= 200000"], "O(n) time, O(1) space"),
    idea("Merge Sorted Lists", "MEDIUM", ["linked-list", "merge"], "Merge two sorted linked lists into one sorted list.", ["0 <= n,m <= 200000"], "O(n + m) time"),
    idea("Cycle Entry Node", "HARD", ["linked-list", "cycle"], "Detect whether a linked list has a cycle and return the entry node index.", ["0 <= n <= 200000"], "O(n) time, O(1) space"),
    idea("Reverse Nodes In K Group", "HARD", ["linked-list", "reversal"], "Reverse nodes in groups of k while preserving incomplete trailing groups.", ["1 <= k <= n <= 200000"], "O(n) time, O(1) space")
  ],
  stack: [
    idea("Valid Bracket Stream", "EASY", ["stack", "brackets"], "Check whether every opening bracket is closed in the correct order.", ["1 <= |s| <= 200000"], "O(n) time, O(n) space"),
    idea("Daily Warmer Signal", "MEDIUM", ["stack", "monotonic-stack"], "For each day, output how many days until a warmer temperature.", ["1 <= n <= 200000"], "O(n) time"),
    idea("Min Stack Operations", "MEDIUM", ["stack", "design"], "Support push, pop, top, and getMin in constant time.", ["1 <= operations <= 200000"], "O(1) per operation"),
    idea("Largest Histogram Rectangle", "HARD", ["stack", "monotonic-stack"], "Find the largest rectangle area in a histogram.", ["1 <= n <= 200000"], "O(n) time"),
    idea("Expression Value With Signs", "HARD", ["stack", "parser"], "Evaluate an expression with integers, plus, minus, and parentheses.", ["1 <= |expression| <= 200000"], "O(n) time")
  ],
  queue: [
    idea("Recent Request Counter", "EASY", ["queue", "simulation"], "Count requests in the last 3000 milliseconds for each incoming timestamp.", ["1 <= requests <= 200000"], "O(1) amortized per request"),
    idea("Rotting Oranges", "MEDIUM", ["queue", "bfs"], "Return minutes needed for all fresh oranges to rot in a grid.", ["1 <= n*m <= 200000"], "O(nm) time"),
    idea("Circular Task Buffer", "MEDIUM", ["queue", "design"], "Implement a fixed-size circular queue with enqueue and dequeue operations.", ["1 <= operations <= 200000"], "O(1) per operation"),
    idea("Shortest Bridge Expansion", "HARD", ["queue", "multi-source-bfs"], "Find the minimum water cells to flip to connect two islands.", ["1 <= n <= 500"], "O(n^2) time"),
    idea("Sliding Window Maximum Queue", "HARD", ["queue", "deque"], "Return the maximum of every window of size k.", ["1 <= k <= n <= 200000"], "O(n) time")
  ],
  recursion: [
    idea("Recursive Digit Sum", "EASY", ["recursion", "math"], "Repeatedly sum digits recursively until one digit remains.", ["0 <= n <= 10^18"], "O(d log n) time"),
    idea("Power By Squaring", "MEDIUM", ["recursion", "divide-conquer"], "Compute x^n modulo 1,000,000,007 using fast exponentiation.", ["0 <= n <= 10^18"], "O(log n) time"),
    idea("Generate Parentheses", "MEDIUM", ["recursion", "generation"], "Generate all valid strings containing n pairs of parentheses.", ["1 <= n <= 10"], "O(Catalan(n)) time"),
    idea("Merge Sort Trace", "HARD", ["recursion", "sorting"], "Return the sorted array and count merge comparisons.", ["1 <= n <= 200000"], "O(n log n) time"),
    idea("Recursive Tree Serialization", "HARD", ["recursion", "tree"], "Serialize and deserialize a binary tree using preorder recursion.", ["0 <= nodes <= 200000"], "O(n) time")
  ],
  "binary-search": [
    idea("First Bad Version", "EASY", ["binary-search", "predicate"], "Find the first true value in a monotonic boolean array.", ["1 <= n <= 200000"], "O(log n) time"),
    idea("Search Rotated Array", "MEDIUM", ["binary-search", "rotated-array"], "Find a target in a rotated sorted array without duplicates.", ["1 <= n <= 200000"], "O(log n) time"),
    idea("Minimum Eating Speed", "MEDIUM", ["binary-search", "answer-search"], "Find the minimum integer speed needed to finish all piles within h hours.", ["1 <= piles.length <= 200000"], "O(n log maxPile) time"),
    idea("Median Of Two Sorted Arrays", "HARD", ["binary-search", "partition"], "Find the median of two sorted arrays in logarithmic time.", ["0 <= n,m <= 200000"], "O(log min(n,m)) time"),
    idea("Split Array Largest Sum", "HARD", ["binary-search", "greedy-check"], "Split an array into k nonempty parts minimizing the largest part sum.", ["1 <= k <= n <= 200000"], "O(n log sum) time")
  ],
  trees: [
    idea("Maximum Tree Depth", "EASY", ["tree", "dfs"], "Return the maximum depth of a binary tree.", ["0 <= nodes <= 200000"], "O(n) time"),
    idea("Path Sum Exists", "MEDIUM", ["tree", "dfs"], "Determine whether any root-to-leaf path has the target sum.", ["0 <= nodes <= 200000"], "O(n) time"),
    idea("Level Order Lines", "MEDIUM", ["tree", "bfs"], "Return node values grouped by tree level.", ["0 <= nodes <= 200000"], "O(n) time"),
    idea("Binary Tree Diameter", "HARD", ["tree", "postorder"], "Return the number of edges in the longest path between any two nodes.", ["0 <= nodes <= 200000"], "O(n) time"),
    idea("Lowest Common Ancestor", "HARD", ["tree", "lca"], "Find the lowest common ancestor of two nodes in a binary tree.", ["1 <= nodes <= 200000"], "O(n) time")
  ],
  bst: [
    idea("BST Search Path", "EASY", ["bst", "search"], "Return whether a target exists in a binary search tree.", ["0 <= nodes <= 200000"], "O(h) time"),
    idea("Validate BST Bounds", "MEDIUM", ["bst", "validation"], "Check whether every node respects strict BST lower and upper bounds.", ["0 <= nodes <= 200000"], "O(n) time"),
    idea("Kth Smallest In BST", "MEDIUM", ["bst", "inorder"], "Return the kth smallest value using inorder traversal.", ["1 <= k <= nodes <= 200000"], "O(h + k) time"),
    idea("Recover Swapped BST", "HARD", ["bst", "inorder"], "Recover a BST where two node values were swapped.", ["2 <= nodes <= 200000"], "O(n) time, O(h) space"),
    idea("BST Iterator", "HARD", ["bst", "iterator"], "Implement next and hasNext using average O(1) time.", ["1 <= operations <= 200000"], "O(h) space")
  ],
  heap: [
    idea("Last Stone Weight", "EASY", ["heap", "max-heap"], "Repeatedly smash the two heaviest stones and return the final weight.", ["1 <= n <= 200000"], "O(n log n) time"),
    idea("Top K Frequent", "MEDIUM", ["heap", "frequency"], "Return the k most frequent numbers.", ["1 <= k <= unique values"], "O(n log k) time"),
    idea("Meeting Room Scheduler", "MEDIUM", ["heap", "intervals"], "Return the minimum rooms needed for all meetings.", ["1 <= meetings <= 200000"], "O(n log n) time"),
    idea("Median Stream", "HARD", ["heap", "two-heaps"], "Output the median after each inserted value.", ["1 <= n <= 200000"], "O(log n) per insert"),
    idea("Kth Smallest Matrix Value", "HARD", ["heap", "matrix"], "Find the kth smallest value in a row and column sorted matrix.", ["1 <= n <= 500"], "O(k log n) time")
  ],
  graph: [
    idea("Connected Components", "EASY", ["graph", "dfs"], "Count connected components in an undirected graph.", ["1 <= n,m <= 200000"], "O(n + m) time"),
    idea("Course Schedule", "MEDIUM", ["graph", "topological-sort"], "Determine whether all courses can be finished given prerequisites.", ["1 <= courses <= 200000"], "O(n + m) time"),
    idea("Shortest Path In Grid", "MEDIUM", ["graph", "bfs"], "Return the shortest path length from top-left to bottom-right in a binary grid.", ["1 <= n*m <= 200000"], "O(nm) time"),
    idea("Network Delay Time", "HARD", ["graph", "dijkstra"], "Return how long it takes for a signal to reach all nodes.", ["1 <= n,m <= 200000"], "O((n + m) log n) time"),
    idea("Critical Connections", "HARD", ["graph", "tarjan"], "Find all bridges in an undirected network.", ["1 <= n,m <= 200000"], "O(n + m) time")
  ],
  dp: [
    idea("Climbing Stairs", "EASY", ["dp", "fibonacci"], "Count ways to climb n steps using 1 or 2 steps.", ["1 <= n <= 100000"], "O(n) time, O(1) space"),
    idea("House Robber", "MEDIUM", ["dp", "linear"], "Maximize money robbed without robbing adjacent houses.", ["1 <= n <= 200000"], "O(n) time"),
    idea("Coin Change Minimum", "MEDIUM", ["dp", "unbounded-knapsack"], "Find the minimum number of coins needed to make an amount.", ["1 <= amount <= 100000"], "O(amount * coins) time"),
    idea("Longest Increasing Subsequence", "HARD", ["dp", "binary-search"], "Return the length of the longest strictly increasing subsequence.", ["1 <= n <= 200000"], "O(n log n) time"),
    idea("Edit Distance", "HARD", ["dp", "strings"], "Return minimum insertions, deletions, and replacements to convert one word to another.", ["1 <= n,m <= 2000"], "O(nm) time")
  ],
  greedy: [
    idea("Assign Cookies", "EASY", ["greedy", "sorting"], "Maximize satisfied children by assigning cookies to greed factors.", ["1 <= n,m <= 200000"], "O(n log n + m log m) time"),
    idea("Minimum Arrows", "MEDIUM", ["greedy", "intervals"], "Find the minimum arrows needed to burst all balloon intervals.", ["1 <= intervals <= 200000"], "O(n log n) time"),
    idea("Gas Station Circuit", "MEDIUM", ["greedy", "prefix"], "Return a starting station index that completes the circuit, or -1.", ["1 <= n <= 200000"], "O(n) time"),
    idea("Jump Game Minimum", "HARD", ["greedy", "range"], "Return the minimum jumps needed to reach the last index.", ["1 <= n <= 200000"], "O(n) time"),
    idea("Task Scheduler Idle Time", "HARD", ["greedy", "counting"], "Return minimum time to execute tasks with cooldown.", ["1 <= tasks <= 200000"], "O(n) time")
  ],
  trie: [
    idea("Prefix Dictionary", "EASY", ["trie", "prefix"], "Insert words and answer whether a prefix exists.", ["1 <= operations <= 200000"], "O(total characters) time"),
    idea("Replace Words", "MEDIUM", ["trie", "dictionary"], "Replace each word in a sentence with the shortest dictionary root.", ["1 <= total characters <= 200000"], "O(total characters) time"),
    idea("Word Search Board", "MEDIUM", ["trie", "backtracking"], "Find dictionary words present in a character board.", ["1 <= board cells <= 10000"], "O(cells * branching) time"),
    idea("Maximum XOR Pair", "HARD", ["trie", "bits"], "Find the maximum XOR of any pair of numbers using a binary trie.", ["1 <= n <= 200000"], "O(n * 31) time"),
    idea("Autocomplete Top Three", "HARD", ["trie", "ranking"], "Return top three lexicographic suggestions after each typed character.", ["1 <= products <= 20000"], "O(total characters log n) preprocessing")
  ],
  "segment-tree": [
    idea("Range Sum Query", "EASY", ["segment-tree", "query"], "Answer range sum queries over a static array.", ["1 <= n,q <= 200000"], "O((n + q) log n) time"),
    idea("Point Update Minimum", "MEDIUM", ["segment-tree", "point-update"], "Support point updates and range minimum queries.", ["1 <= n,q <= 200000"], "O(log n) per operation"),
    idea("Lazy Range Add", "MEDIUM", ["segment-tree", "lazy"], "Support range addition and range sum queries.", ["1 <= n,q <= 200000"], "O(log n) per operation"),
    idea("Kth One Query", "HARD", ["segment-tree", "order-statistics"], "Flip bits and find the index of the kth one.", ["1 <= n,q <= 200000"], "O(log n) per operation"),
    idea("Maximum Subarray Query", "HARD", ["segment-tree", "merge-nodes"], "After point updates, return the maximum subarray sum.", ["1 <= n,q <= 200000"], "O(log n) per operation")
  ],
  backtracking: [
    idea("Subsets", "EASY", ["backtracking", "subsets"], "Generate all subsets of distinct numbers.", ["1 <= n <= 20"], "O(n * 2^n) time"),
    idea("Combination Sum", "MEDIUM", ["backtracking", "combinations"], "Find unique combinations that sum to target using unlimited candidates.", ["1 <= candidates <= 30"], "O(number of solutions) time"),
    idea("Permutations", "MEDIUM", ["backtracking", "permutations"], "Generate all permutations of distinct numbers.", ["1 <= n <= 10"], "O(n * n!) time"),
    idea("N Queens", "HARD", ["backtracking", "constraints"], "Return all valid placements of n queens on an n by n board.", ["1 <= n <= 12"], "O(n!) time"),
    idea("Sudoku Solver", "HARD", ["backtracking", "grid"], "Fill a 9 by 9 Sudoku board so every row, column, and box is valid.", ["board is 9 x 9"], "Backtracking with pruning")
  ],
  "sliding-window": [
    idea("Maximum Average Subarray", "EASY", ["sliding-window", "fixed"], "Find the maximum average of any subarray of length k.", ["1 <= k <= n <= 200000"], "O(n) time"),
    idea("Longest Unique Substring", "MEDIUM", ["sliding-window", "set"], "Return the length of the longest substring without repeated characters.", ["1 <= |s| <= 200000"], "O(n) time"),
    idea("Minimum Size Subarray Sum", "MEDIUM", ["sliding-window", "variable"], "Find the shortest subarray with sum at least target.", ["1 <= n <= 200000"], "O(n) time"),
    idea("Minimum Window Substring", "HARD", ["sliding-window", "frequency"], "Return the smallest substring of s containing all characters of t.", ["1 <= |s|, |t| <= 200000"], "O(n + m) time"),
    idea("Permutation In String", "HARD", ["sliding-window", "anagram"], "Determine whether s2 contains a permutation of s1.", ["1 <= |s1| <= |s2| <= 200000"], "O(n) time")
  ],
  "two-pointers": [
    idea("Two Sum Sorted", "EASY", ["two-pointers", "sorted-array"], "Return two 1-based indices whose sorted values sum to target.", ["2 <= n <= 200000"], "O(n) time"),
    idea("Remove Duplicates Sorted", "MEDIUM", ["two-pointers", "in-place"], "Remove duplicates in-place and return the new length.", ["1 <= n <= 200000"], "O(n) time, O(1) space"),
    idea("Container With Most Water", "MEDIUM", ["two-pointers", "opposite"], "Find the maximum water area between two vertical lines.", ["2 <= n <= 200000"], "O(n) time"),
    idea("Trapping Rain Water", "HARD", ["two-pointers", "prefix-max"], "Compute total trapped rain water between bars.", ["1 <= n <= 200000"], "O(n) time, O(1) space"),
    idea("Three Sum Unique", "HARD", ["two-pointers", "sorting"], "Return all unique triplets whose sum is zero.", ["3 <= n <= 5000"], "O(n^2) time")
  ],
  "bit-manipulation": [
    idea("Single Number", "EASY", ["bit", "xor"], "Every number appears twice except one; return the single number.", ["1 <= n <= 200000"], "O(n) time, O(1) space"),
    idea("Count Set Bits", "MEDIUM", ["bit", "dynamic"], "Return the number of set bits for every integer from 0 to n.", ["0 <= n <= 1000000"], "O(n) time"),
    idea("Subset Mask Sum", "MEDIUM", ["bit", "subsets"], "Compute the sum of XOR totals for all subsets.", ["1 <= n <= 20"], "O(2^n) time"),
    idea("Minimum XOR Pair", "HARD", ["bit", "sorting"], "Find the minimum XOR of any pair of numbers.", ["2 <= n <= 200000"], "O(n log n) time"),
    idea("Maximum Product Word Masks", "HARD", ["bit", "masks"], "Find maximum product of word lengths for two words sharing no letters.", ["1 <= words <= 20000"], "O(n^2) with bit pruning")
  ],
  "union-find": [
    idea("Find Connected Queries", "EASY", ["union-find", "connectivity"], "Process union operations and answer whether pairs are connected.", ["1 <= n,q <= 200000"], "Almost O(1) amortized per operation"),
    idea("Number Of Provinces", "MEDIUM", ["union-find", "components"], "Count connected components from an adjacency matrix.", ["1 <= n <= 1000"], "O(n^2 alpha(n)) time"),
    idea("Redundant Connection", "MEDIUM", ["union-find", "cycle"], "Return the edge that creates the first cycle in an undirected graph.", ["1 <= edges <= 200000"], "O(n alpha(n)) time"),
    idea("Accounts Merge", "HARD", ["union-find", "hashing"], "Merge accounts that share at least one email address.", ["1 <= accounts <= 20000"], "O(total emails alpha(n)) time"),
    idea("Minimum Spanning Network", "HARD", ["union-find", "kruskal"], "Return the total weight of a minimum spanning tree using Kruskal's algorithm.", ["1 <= n,m <= 200000"], "O(m log m) time")
  ]
};

function idea(
  title: string,
  difficulty: Difficulty,
  tags: string[],
  statement: string,
  constraints: string[],
  expectedComplexity: string
): ProblemIdea {
  return {
    title,
    difficulty,
    tags,
    statement: `${statement}\n\nInput follows the format described by the problem title. Output only the requested answer.`,
    constraints,
    examples: [
      {
        input: "5\n1 2 3 4 5",
        output: "3",
        explanation: "The sample exercises the central invariant of the problem on a small ordered input."
      },
      {
        input: "6\n2 2 1 3 4 4",
        output: "2",
        explanation: "Repeated values and boundary positions are included to expose off-by-one mistakes."
      }
    ],
    hiddenTestCases: [
      { input: "1\n7", expectedOutput: "1" },
      { input: "4\n4 3 2 1", expectedOutput: "2" },
      { input: "8\n1 1 2 3 5 8 13 21", expectedOutput: "5" },
      { input: "10\n0 0 0 0 0 0 0 0 0 0", expectedOutput: "0" },
      { input: "7\n9 1 8 2 7 3 6", expectedOutput: "4" }
    ],
    expectedComplexity,
    hints: [
      "Name the invariant before writing loops or recursive calls.",
      "Trace the sample and one smallest boundary case.",
      "Avoid recomputing information that can be carried forward."
    ],
    editorial: `A strong solution starts with the simplest brute force idea, then removes repeated work using ${tags.join(", ")}. Maintain the invariant at every step, update the answer only after the invariant is valid, and verify the stated ${expectedComplexity}.`
  };
}

export function buildTopicSeeds() {
  return topics.map((topic, index) => ({
    slug: topic.slug,
    title: topic.title,
    sortOrder: index + 1,
    description: topic.description,
    theory:
      `${topic.title} problems ask you to identify the state that matters and update it consistently. ${topic.focus} ` +
      `Start with the brute-force approach, then look for repeated work that can be replaced by ${topic.techniques.slice(0, 2).join(" or ")}.`,
    notes:
      `Core techniques: ${topic.techniques.join(", ")}. Before coding, write the input size, the invariant, and the edge cases. ` +
      `After coding, test empty or minimum input, duplicates, already sorted or reversed data, and values at the constraint limits.`,
    visualGuide:
      `Draw ${topic.title.toLowerCase()} state changes step by step. Use arrows for moving indices, boxes for stored state, and a separate answer variable. ` +
      `Every time state changes, mark the condition that made the move legal.`,
    commonMistakes: [
      "Updating the answer before the invariant is restored.",
      "Forgetting duplicate, empty, or single-element cases.",
      "Using the right data structure but storing insufficient state.",
      "Claiming optimal complexity without counting nested helper work."
    ],
    prerequisites: index === 0 ? [] : [topics[index - 1].slug],
    nextTopics: topics[index + 1] ? [topics[index + 1].slug] : [],
    quizzes: [
      {
        question: `What is the most important first step in a ${topic.title} problem?`,
        options: ["Define the state and invariant", "Choose the shortest variable names", "Start with the hardest optimization", "Skip sample tracing"],
        answer: "Define the state and invariant",
        explanation: "The invariant explains what must remain true after each operation, which guides both correctness and debugging."
      },
      {
        question: `Which technique belongs naturally with ${topic.title}?`,
        options: [topic.techniques[0], "Random guessing", "Manual hardcoding", "Ignoring constraints"],
        answer: topic.techniques[0],
        explanation: `${topic.techniques[0]} is a core tool for this topic and usually follows from the input constraints.`
      }
    ]
  }));
}

export function buildProblemSeeds() {
  return topics.flatMap((topic) =>
    problemIdeasByTopic[topic.slug].map((problem, index) => ({
      slug: `${topic.slug}-${slugify(problem.title)}`,
      title: problem.title,
      topicSlug: topic.slug,
      difficulty: problem.difficulty,
      tags: [...new Set([topic.slug, ...problem.tags])],
      statement: problem.statement,
      constraints: problem.constraints,
      examples: problem.examples,
      hiddenTestCases: problem.hiddenTestCases,
      expectedComplexity: problem.expectedComplexity,
      hints: problem.hints,
      editorial: problem.editorial,
      order: index + 1
    }))
  );
}

const achievements = [
  {
    slug: "first-accepted",
    name: "First Accepted",
    description: "Solve your first problem.",
    type: "SOLVED" as const,
    xpReward: 50,
    unlockCondition: { solvedProblems: 1 }
  },
  {
    slug: "ten-problems",
    name: "Ten Problem Run",
    description: "Solve ten unique problems.",
    type: "SOLVED" as const,
    xpReward: 100,
    unlockCondition: { solvedProblems: 10 }
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
  }
];

const contestSeeds = [
  {
    slug: "arrays-and-strings-sprint",
    title: "Arrays and Strings Sprint",
    description: "A fast fundamentals contest focused on scans, counts, and prefix reasoning.",
    status: "UPCOMING" as ContestStatus,
    offsetDays: 1,
    problemSlugs: ["arrays-balanced-prefix-index", "strings-first-unique-character", "sliding-window-maximum-average-subarray", "two-pointers-two-sum-sorted"]
  },
  {
    slug: "data-structure-gauntlet",
    title: "Data Structure Gauntlet",
    description: "Stack, queue, heap, trie, and linked list problems in one timed round.",
    status: "UPCOMING" as ContestStatus,
    offsetDays: 4,
    problemSlugs: ["stack-daily-warmer-signal", "queue-rotting-oranges", "heap-top-k-frequent", "trie-replace-words"]
  },
  {
    slug: "graphs-and-sets-challenge",
    title: "Graphs and Sets Challenge",
    description: "Connectivity, traversal, and disjoint-set reasoning under contest pressure.",
    status: "UPCOMING" as ContestStatus,
    offsetDays: 7,
    problemSlugs: ["graph-connected-components", "graph-course-schedule", "union-find-redundant-connection", "graph-network-delay-time"]
  },
  {
    slug: "dp-greedy-showdown",
    title: "DP Greedy Showdown",
    description: "Choose between local proof and stored subproblem state.",
    status: "UPCOMING" as ContestStatus,
    offsetDays: 10,
    problemSlugs: ["dp-house-robber", "greedy-minimum-arrows", "dp-longest-increasing-subsequence", "greedy-jump-game-minimum"]
  },
  {
    slug: "advanced-structures-cup",
    title: "Advanced Structures Cup",
    description: "Segment tree, BST, bit manipulation, and backtracking problems for advanced practice.",
    status: "UPCOMING" as ContestStatus,
    offsetDays: 14,
    problemSlugs: ["segment-tree-lazy-range-add", "bst-kth-smallest-in-bst", "bit-manipulation-maximum-product-word-masks", "backtracking-n-queens"]
  }
];

const mockInterviewTopicSlugs = [
  "arrays",
  "strings",
  "linked-list",
  "stack",
  "binary-search",
  "trees",
  "graph",
  "dp",
  "greedy",
  "union-find"
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function seedCatalog(prisma: PrismaClient, options: { log?: boolean } = {}) {
  const log = options.log ?? false;
  const topicSeeds = buildTopicSeeds();
  const problemSeeds = buildProblemSeeds();

  for (const topic of topicSeeds) {
    const saved = await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        title: topic.title,
        sortOrder: topic.sortOrder,
        description: topic.description,
        theory: topic.theory,
        notes: topic.notes,
        visualGuide: topic.visualGuide,
        commonMistakes: topic.commonMistakes,
        prerequisites: topic.prerequisites,
        nextTopics: topic.nextTopics
      },
      create: {
        slug: topic.slug,
        title: topic.title,
        sortOrder: topic.sortOrder,
        description: topic.description,
        theory: topic.theory,
        notes: topic.notes,
        visualGuide: topic.visualGuide,
        commonMistakes: topic.commonMistakes,
        prerequisites: topic.prerequisites,
        nextTopics: topic.nextTopics
      }
    });

    for (const [index, quiz] of topic.quizzes.entries()) {
      await prisma.quiz.upsert({
        where: { id: `seed-quiz-${topic.slug}-${index + 1}` },
        update: {
          topicId: saved.id,
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
          explanation: quiz.explanation
        },
        create: {
          id: `seed-quiz-${topic.slug}-${index + 1}`,
          topicId: saved.id,
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
          explanation: quiz.explanation
        }
      });
    }
  }

  for (const problem of problemSeeds) {
    const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: problem.topicSlug } });
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {
        title: problem.title,
        difficulty: problem.difficulty,
        statement: problem.statement,
        constraints: problem.constraints,
        examples: problem.examples,
        hiddenTestCases: problem.hiddenTestCases,
        expectedComplexity: problem.expectedComplexity,
        hints: problem.hints,
        editorial: problem.editorial,
        tags: problem.tags,
        topicId: topic.id,
        isGenerated: false
      },
      create: {
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        statement: problem.statement,
        constraints: problem.constraints,
        examples: problem.examples,
        hiddenTestCases: problem.hiddenTestCases,
        expectedComplexity: problem.expectedComplexity,
        hints: problem.hints,
        editorial: problem.editorial,
        tags: problem.tags,
        topicId: topic.id,
        isGenerated: false
      }
    });
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement
    });
  }

  const baseDate = startOfDay(addDays(new Date(), 1));
  for (const contestSeed of contestSeeds) {
    const contest = await prisma.contest.upsert({
      where: { slug: contestSeed.slug },
      update: {
        title: contestSeed.title,
        description: contestSeed.description,
        startsAt: addDays(baseDate, contestSeed.offsetDays),
        endsAt: addHours(addDays(baseDate, contestSeed.offsetDays), 3),
        status: contestSeed.status
      },
      create: {
        slug: contestSeed.slug,
        title: contestSeed.title,
        description: contestSeed.description,
        startsAt: addDays(baseDate, contestSeed.offsetDays),
        endsAt: addHours(addDays(baseDate, contestSeed.offsetDays), 3),
        status: contestSeed.status
      }
    });

    for (const [index, problemSlug] of contestSeed.problemSlugs.entries()) {
      const problem = await prisma.problem.findUniqueOrThrow({ where: { slug: problemSlug } });
      await prisma.contestProblem.upsert({
        where: {
          contestId_problemId: {
            contestId: contest.id,
            problemId: problem.id
          }
        },
        update: {
          sortOrder: index + 1,
          points: 100 + index * 100
        },
        create: {
          contestId: contest.id,
          problemId: problem.id,
          sortOrder: index + 1,
          points: 100 + index * 100
        }
      });
    }
  }

  const seedUser = await prisma.user.upsert({
    where: { email: "seed-interviewer@dsa-mentor-ai.local" },
    update: {
      name: "DSA Mentor AI Seed Interviewer",
      role: "USER"
    },
    create: {
      email: "seed-interviewer@dsa-mentor-ai.local",
      name: "DSA Mentor AI Seed Interviewer",
      role: "USER"
    }
  });

  for (const [index, topicSlug] of mockInterviewTopicSlugs.entries()) {
    const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: topicSlug } });
    await prisma.mockInterview.upsert({
      where: { id: `seed-mock-interview-${topicSlug}` },
      update: {
        userId: seedUser.id,
        topicId: topic.id,
        question: interviewQuestion(topic.title),
        answer: null,
        evaluation: Prisma.JsonNull,
        recommendation: null,
        score: null,
        completedAt: null
      },
      create: {
        id: `seed-mock-interview-${topicSlug}`,
        userId: seedUser.id,
        topicId: topic.id,
        question: interviewQuestion(topic.title, index)
      }
    });
  }

  const counts = {
    topics: await prisma.topic.count(),
    problems: await prisma.problem.count(),
    contests: await prisma.contest.count(),
    mockInterviews: await prisma.mockInterview.count()
  };

  if (log) {
    console.log(`Seed complete: ${counts.topics} topics, ${counts.problems} problems, ${counts.contests} contests, ${counts.mockInterviews} mock interviews.`);
  }

  return counts;
}

function interviewQuestion(topicTitle: string, index = 0) {
  const difficulties: Difficulty[] = ["EASY", "MEDIUM", "MEDIUM", "HARD"];
  return {
    title: `${topicTitle} Interview Drill`,
    prompt: `Design and explain an efficient solution for a ${topicTitle} problem. Discuss brute force, optimized approach, correctness, complexity, and edge cases before coding.`,
    difficulty: difficulties[index % difficulties.length],
    constraints: ["Input size may reach 200000 elements or operations.", "Solutions should avoid unnecessary quadratic work.", "Explain failure cases and tradeoffs clearly."],
    examples: [
      {
        input: "5\n1 2 3 4 5",
        output: "valid optimized result",
        explanation: "The interviewer expects the candidate to reason from a small trace to the general invariant."
      }
    ],
    followUps: [
      "How would the solution change for streaming input?",
      "Which edge case is easiest to miss?",
      "Can memory usage be reduced without hurting readability?"
    ]
  };
}

export async function isCatalogEmpty(prisma: PrismaClient) {
  const [topicsCount, problemsCount, contestsCount] = await Promise.all([
    prisma.topic.count(),
    prisma.problem.count(),
    prisma.contest.count()
  ]);

  return topicsCount === 0 || problemsCount === 0 || contestsCount === 0;
}

Perceptron notes (from http://neuralnetworksanddeeplearning.com/chap1.html)

Defining a neural network can start like:

1. Determine what you want to have a binary decision for (0/1, yes/no, on/off, stay/go, etc...)
2. Determine how many factors are involved in the first layer (e.g. weather, mood, funds)
3. Determine the weight of each factor (bad weather = 0, weight = 6, good mood = 1, weight = 3, etc...)
4. Determine the "firing" threshold (e.g. >= 5 to fire, otherwise not)

Thoughts: create a program to visually model these formal scenarios?

[layer 1]

Label: X | Weight: 2
Label: Y | Weight: 3
Label: Z | Weight : 4

Threshold: 7

Example output scenarios:

X = 0 (Weight 2)
Y = 0 (Weight 3)
Z = 1 (Weight 4)

Sum (4) > Threshold (7) ? No. Will not fire.

X = 1 (Weight 2)
Y = 1 (Weight 3)
Z = 1 (Weight 4)

Sum (9) > Threshold (7) ? Yes. Will fire.

Visual graph below / right:

X Y Z
O O O
\ | /
  O

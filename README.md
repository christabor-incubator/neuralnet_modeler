# A neural network visual modeling tool

The goal is to create a tool that bridges the gap between using a neural net for machine learning (classification, etc) and modeling the actual, real world problem. Knowing how it works does not necessarily make it easy to model the problem itself.

## TODO:
* allow have run simulation
* validator for indivudal weights
* validator for threshold firing (must be >= sum of weights for layer)
* bounding box fugly
* margins on svg
* svg resizing betterment
* validator for final layer having only one node
* visual cleanup/polish (overlapping text, labels, etc)
* hover highlighting for nodes/edges when editing on right side
* visual input box formatting for errors/validation

## New components

Classification modeling. Allows you to define the classification problem, keep track of the number of features (characteristics of the data set) to use for training, show sample data, and then run training.

# A neural network visual modeling tool

The goal is to create a tool that bridges the gap between using a neural net for machine learning (classification, etc) and modeling the actual, real world problem. Knowing how it works does not necessarily make it easy to model the problem itself.

## TODO:
* allow have run simulation
* validator for indivudal weights
* validator for threshold firing (must be >= sum of weights for layer)
* bounding box fugly
* margins on svg
* svg resizing betterment
* visual cleanup/polish (overlapping text, labels, etc)
* hover highlighting for nodes/edges when editing on right side
* visual input box formatting for errors/validation
* Add optional notion of convolution
* Potential table for modeling false positives etc... (See https://d262ilb51hltx0.cloudfront.net/max/800/1*lgSDQ4-Js3elXBpavIp6FA.png, https://medium.com/@ageitgey/machine-learning-is-fun-part-3-deep-learning-and-convolutional-neural-networks-f40359318721#.3uu8gqvld)

## New components

Classification modeling. Allows you to define the classification problem, keep track of the number of features (characteristics of the data set) to use for training, show sample data, and then run training.

See https://georgemdallas.wordpress.com/2013/06/11/big-data-data-mining-and-machine-learning-under-the-hood/ for a great example of what the goal is in terms of intuitive understanding, with an interactive component.

Also see: https://medium.com/@ageitgey/machine-learning-is-fun-part-2-a26a10b68df3#.xca85gur3

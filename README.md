# Javascript Stuff - Interface designer

This is basically a testing ground for some basic javascript i do. Its not very special and i am most likely reinventing the wheel here. 

## What are you doing?

I am trying to do some basic lay-outing without using any jquery, jquery-ui, angular, scriptapolous (*or however that is written*). 

The idea is as follows: we got a number of elements that may or not may use up one slot in a grid. As i finally want to integrate this into a typo3 plugin i want to get some output from the back end that is the content of the blocks, then rearrange them to a grid, make some elements bigger than one grid, insert some placeholder/stretcher and then save it up so the content of that plugin then can be displayed on a website.

## Goals

* Drag & Drop Interface
* Resizing the size of the elements 
* automatically adjusting the grid to accommodate extensions
* calculating the final grid size of the element
* preview how it would look in the finished *product*
* Load & Save those settings
* alter between states back and forth.
* show a shadowy outline of what will be reality when you release the grip
* maybe make it touchscreen capable as well

## examples

To get this thing started i shopped around a bit and copied some examples that i am using as basics for my further testing. Those are one file html-files that can be displayed as it without any further script/style files. The main html file does need separate files.
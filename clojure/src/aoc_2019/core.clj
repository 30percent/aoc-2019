(ns aoc-2019.core
  (:gen-class))
(require 'aoc-2019.day1-1.index)

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (aoc-2019.day1-1.index/calcTotalFuel 
    (aoc-2019.day1-1.index/fetchList "src/aoc_2019/day1/modules.txt")))
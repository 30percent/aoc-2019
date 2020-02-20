(ns aoc-2019.day1.step1
  (:gen-class))

(defn fetchList
  [fileName]
  (map read-string (clojure.string/split-lines (slurp fileName)))
)

(defn calcFuel
  [mass]
  (- (Math/floor (/ mass 3))
     2)
)

(defn calcTotalFuel
  [modules]
  (reduce + (map calcFuel modules))
)
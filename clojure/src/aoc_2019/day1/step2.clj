(ns aoc-2019.day1.step2
  (:gen-class))

(defn fetchList
  [fileName]
  (map read-string (clojure.string/split-lines (slurp fileName)))
)

(defn calcFuel
  [mass]
  (let 
    [curFuel (- (Math/floor (/ mass 3)) 2)]
    (if (> curFuel 0) 
      (+ curFuel (calcFuel curFuel)) 
      0))
)

(defn calcTotalFuel
  [modules]
  (reduce + (map calcFuel modules))
)
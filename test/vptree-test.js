/*╔═════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 *║                                                                                                         ║
 *║      VPTree test-suite.                                                                                 ║
 *║                                                                                                         ║
 *╚═════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

(function() {
	var gridSize = 10,
		// Not pre-allocating is faster : http://jsperf.com/pre-allocated-arrays
		S = [],
		bucketSize = 0,
		vptree, vptreeb, vptree2, vptreeb2;

	// Standard 2D-euclidean distance.
	function EUCLIDEAN2(a, b) {
		var dx = a[0] - b[0],
			dy = a[1] - b[1];
		return Math.sqrt(dx*dx + dy*dy);
	}


	/* Builds 4 vp-trees for a set of points on a square grid
	 * with positive integer coordinates.
	 * With gridSize = 3 :
	 *			  y
	 *			  │
	 *			2 2   5   8
	 *			  │
	 *			1 1   4   7
	 *			  │
	 *			0 0───3───6───x
	 *			  0   1   2
	 */
	function buildTrees() {
		// Building the set of 2D-points.
		if(S.length === 0) {
			var i = 0;
			for(var x = 0; x < gridSize; x++) {
				for(var y = 0; y < gridSize; y++) {
					S[i++] = [x, y];
				}
			}
		}

		// VPTreeFactory.build
		vptree = VPTreeFactory.build(S, EUCLIDEAN2, 0);
		vptreeb = VPTreeFactory.build(S, EUCLIDEAN2, 5);

		// VPTreeFactory.load
		var stringified, stringifiedb;
		eval('stringified = '+vptree.stringify());
		eval('stringifiedb = '+vptreeb.stringify());
		vptree2 = VPTreeFactory.load(S, EUCLIDEAN2, stringified);
		vptreeb2 = VPTreeFactory.load(S, EUCLIDEAN2, stringifiedb);
	}

	// Search elements that are known to be present in the set.
	function searchElements(vptree) {
		var result;
		for(var i = 0, n = S.length; i < n; i++) {
			result = vptree.search(S[i], 1);
			equal(result.length, 1, "point ["+S[i]+']');
			equal(result[0], i);
		}
	}

	// Search the nearest element to one that is known not to be present in the set.
	function searchNearestOne(vptree) {
		var result;
		for(var i = 0, n = S.length; i < n; i++) {
			var point = S[i],
				x = point[0],
				y = point[1],
				result = vptree.search([x+0.1, y+0.4], 1);
			equal(result.length, 1, "point ["+(x+0.1)+', '+(y+0.4)+']');
			equal(result[0], i);
		}
	}

	// Search the 2 elements nearest to one that is known not to be present in the set.
	function searchNearestTwo(vptree) {
		var x, y, i = 0, result, expected;
		for(x = 0; x < gridSize; x++) {
			for(y = 0; y < gridSize; y++) {
				result = vptree.search([x+0.1, y+0.4], 2);
				equal(result.length, 2, "point ["+(x+0.1)+', '+(y+0.4)+']');
				equal(result[0], i);
				// What second nearest element do we expect ?
				// Inside the grid, it's the element just above i.
				expected = i+1;
				// But outside the grid ?
				if(y === gridSize-1) {
					// Above the grid, it's the element on the right of i.
					if(x < gridSize-1) expected = i + gridSize;
					// Outside the right corner, it's the element on the left of i.
					else expected = i - gridSize;
				}
				equal(result[1], expected);
				i++;
			}
		}
	}

	// Search the 3 elements nearest to one that is known not to be present in the set.
	function searchNearestThree(vptree) {
		var x, y, i = 0, result, expected;
		for(x = 0; x < gridSize; x++) {
			for(y = 0; y < gridSize; y++) {
				result = vptree.search([x+0.1, y+0.4], 3);
				equal(result.length, 3, "point ["+(x+0.1)+', '+(y+0.4)+']');
				equal(result[0], i);

				// What second nearest element do we expect ?
				// Inside the grid, it's the element just above i.
				expected = i+1;
				// But outside the grid ?
				if(y === gridSize-1) {
					// Above the grid, it's the element on the right of i.
					if(x < gridSize-1) expected = i + gridSize;
					// Outside the right corner, it's the element on the left of i.
					else expected = i - gridSize;
				}
				equal(result[1], expected);

				// What third nearest element do we expect ?
				// Inside the grid, it's the element on the right of i.
				expected = i + gridSize;
				// Above the top-left and top-right corners, it's the point below i.
				if(i === gridSize-1 || i === gridSize*gridSize-1) expected = i-1;
				// For all the other points outside the grid, it's the point on le left of i.
				else if(x === gridSize-1 || y === gridSize-1) expected = i - gridSize;
				equal(result[2], expected);

				i++;
			}
		}
	}



	buildTrees();

	window.searchTest = {
		// Initially built vptree, no buckets
		searchElements: function() { searchElements(vptree); },
		searchNearestOne: function() { searchNearestOne(vptree); },
		searchNearestTwo: function() { searchNearestTwo(vptree); },
		searchNearestThree: function() { searchNearestThree(vptree); },

		// Initially built vptree, buckets of 5 elements
		searchElementsB: function() { searchElements(vptreeb); },
		searchNearestOneB: function() { searchNearestOne(vptreeb); },
		searchNearestTwoB: function() { searchNearestTwo(vptreeb); },
		searchNearestThreeB: function() { searchNearestThree(vptreeb); },

		// Stringified and reloaded vptree, no buckets
		searchElementsS: function() { searchElements(vptree2); },
		searchNearestOneS: function() { searchNearestOne(vptree2); },
		searchNearestTwoS: function() { searchNearestTwo(vptree2); },
		searchNearestThreeS: function() { searchNearestThree(vptree2); },

		// Stringified and reloaded vptree, buckets of 5 elements
		searchElementsBS: function() { searchElements(vptreeb2); },
		searchNearestOneBS: function() { searchNearestOne(vptreeb2); },
		searchNearestTwoBS: function() { searchNearestTwo(vptreeb2); },
		searchNearestThreeBS: function() { searchNearestThree(vptreeb2); }
	}
}());
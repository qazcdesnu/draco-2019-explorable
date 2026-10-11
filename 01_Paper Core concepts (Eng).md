
## Paper

**Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco**

- Authors: Dominik Moritz, Chenglong Wang, Greg L. Nelson, Halden Lin,
  Adam M. Smith, Bill Howe, Jeffrey Heer
- Publication: *IEEE Transactions on Visualization and Computer
  Graphics*, 25(1), 438--448, 2019
- DOI: https://doi.org/10.1109/TVCG.2018.2865240
- Project: https://idl.uw.edu/draco/ (the paper's original URL, https://uwdata.github.io/draco/, now redirects here)
- 2019 Draco demo (Draco Editor): https://idl.uw.edu/draco-editor/#/editor

## Research motivation

There is a gap between visualization design guidelines and their
application in visualization tools. The paper proposes representing
design knowledge as constraints so that it can be used by automated
visualization-design systems, combined across studies, tested, and
extended.

## 1. Encoding

**Definition:** Encoding is the mapping of data attributes to visual
properties (visual channels) of graphical marks.

- **Data attributes:** variables such as height, weight, sales, or
  category.
- **Marks:** visual elements such as points, lines, and bars.
- **Visual channels:** visual properties such as position, length,
  color, size, and shape.

**Example:** In a scatterplot, map height to the x-position and weight
to the y-position. The data are the same if the mappings change, but the
visual encoding changes.

**Role in Draco:** Draco represents design choices such as which data
fields map to which visual channels, then uses design constraints to
assess or recommend possible encodings.

## 2. Vega-Lite grammar

**Definition:** Vega-Lite is a high-level grammar of graphics that
describes visualizations declaratively as JSON (Satyanarayan et al.,
2017). Instead of drawing instructions, a specification states which
data, which mark, and which field maps to which channel; the compiler
fills in the rest (scales, axes, legends) with sensible defaults. It is
inspired by Wilkinson's Grammar of Graphics, ggplot2, and Tableau's
VizQL.

### Basic structure (single view)

```json
{
  "data": {"url": "cars.csv"},
  "mark": "bar",
  "encoding": {
    "x": {"field": "Cylinders", "type": "ordinal"},
    "y": {"field": "Horsepower", "type": "quantitative", "aggregate": "mean"}
  }
}
```

This bar chart of mean horsepower by number of cylinders is the
example in Fig. 2 of the paper.

| Component | Meaning | Example values |
|---|---|---|
| `data` | Input data: a table of records with named fields | `{"url": ...}`, `{"values": [...]}` |
| `mark` | Geometric object representing each data record | `bar`, `point`, `line`, `area`, `tick`, `text`, `rect`, ... |
| `encoding` | Collection of channel → field definitions | `x`, `y`, `color`, `size`, `shape`, `text`, `detail`, `row`, `column` |
| `transform` | (Optional) data transformations applied before encoding | `filter`, `calculate`, `aggregate`, `bin`, ... |

### Properties of an encoding definition

- **`field`**: the data field to visualize.
- **`type`**: `nominal` (unordered categories), `ordinal` (ordered
  categories), `quantitative` (numbers), `temporal` (time).
- **Transformations**: `aggregate` (`count`, `mean`, `sum`, `median`,
  ...), `bin`, `timeUnit`, `sort`, `stack`.
- **`scale`**: how the data domain maps to the visual range, e.g.
  `{"zero": true}` or `{"type": "log"}`.
- **Guides**: `axis` and `legend`, which visualize scales.
- Omitted properties are **inferred by the compiler** from the channel
  and data type.

### Multi-view and interaction

- **View composition:** `facet` (or trellis plots via the `row`/`column`
  channels), `layer`, `concat`, `repeat`.
- **Interaction:** selections declare brushing, filtering, and
  highlighting. The 2019 Draco does not model them; the paper lists
  them only as future work (§7).

### Role in Draco

1. **Output language:** Draco's optimal designs are returned as Vega-Lite
   specifications, which Vega-Lite then renders (Fig. 1).
2. **Basis of the logical representation:** following CompassQL, Draco
   translates Vega-Lite into logical facts, flattening nested JSON (e.g.
   `scale.zero` becomes `zero(E)`).

   | Vega-Lite JSON | Draco ASP fact |
   |---|---|
   | `"mark": "bar"` | `mark(bar).` |
   | `"x": {...}` | `encoding(e0). channel(e0,x).` |
   | `"field": "Cylinders"` | `field(e0,cylinders).` |
   | `"type": "ordinal"` | `type(e0,ordinal).` |
   | `"aggregate": "mean"` | `aggregate(e1,mean).` |
   | `"bin": true` | `bin/2` (the paper gives only the predicate; the query example uses `bin(e1,_)`) |
   | `"scale": {"zero": true}` / `{"type": "log"}` | `zero(e).` / `log(e).` |
   | `"stack": ...` | `stack/1` |

3. **Designed for search:** Vega-Lite was built from the start to
   support search and inference over the space of possible
   visualizations, which makes it a good target language for automated
   design systems like Draco.
4. **Scope in the paper:** only **single views and faceted views**
   (`row`/`column`), not all of Vega-Lite. This subset still covers bar
   charts, histograms, dot plots, scatter plots, line graphs, and area
   graphs. Layering, concatenation, and interaction are future work.

**Note:** some hard constraints encode **limits of the Vega-Lite
implementation** rather than design quality. For example, Vega-Lite has
only 8 shapes, hence
`:- channel(E,shape), cardinality(E,C), C > 8.`

## 3. Soft constraints

**Definition:** A soft constraint expresses a preference that should
ideally be satisfied but may be violated when necessary. Violations
incur a cost or penalty, allowing a system to compare trade-offs among
designs.

A simplified objective is:

`Total cost = Σᵢ wᵢ vᵢ`

- `wᵢ`: weight associated with constraint i.
- `vᵢ`: violation indicator or cost for constraint i.

Lower total cost indicates a design that better satisfies the weighted
preferences, assuming the system minimizes this objective.

**In Draco:** Soft-constraint weights represent the relative importance
of design preferences. The paper also explores learning weights from
experimental data, including graphical-perception experiments.

## 3. Soft and hard constraints

Draco represents visualization-design knowledge as constraints. The key
distinction is whether a rule defines a requirement that must be met or
a preference that can be traded off against other preferences.

### Soft constraints

**Definition:** A soft constraint expresses a design preference that
should ideally be satisfied but may be violated when necessary.
Violations incur a cost or penalty, allowing the system to compare
trade-offs among candidate designs.

A simplified objective is:

`Total cost = Σᵢ wᵢ vᵢ`

-   `wᵢ`: weight associated with constraint i, representing its relative
    importance.
-   `vᵢ`: the constraint's violation indicator or cost.

When the objective is to minimize total cost, designs that violate
high-weight constraints are penalized more heavily than designs that
violate low-weight constraints.

**Role in Draco:** Soft constraints are especially important because
they let the system express degrees of preference rather than treating
every design guideline as an absolute rule. The paper also investigates
learning soft-constraint weights from experimental data, including
graphical-perception experiments.

### Hard constraints

**Definition:** A hard constraint is a requirement that a candidate
solution must satisfy. A candidate that violates it is excluded from the
set of valid solutions.

**Role in Draco:** Hard constraints define the space of admissible
designs. Soft constraints then help distinguish which of those designs
is more desirable.

### Key distinction

-   **Hard constraint --- validity:** Is this design allowed?
-   **Soft constraint --- preference:** Among allowed designs, how
    desirable is this design?

Whether a particular design rule is hard or soft depends on how the
system formalizes and applies it. The paper's central interest here is
how design preferences can be represented as soft constraints and how
their weights can be learned from experimental data.

## 4. Answer Set Programming (ASP)

**Definition:** ASP is a declarative programming paradigm in which a
problem is represented using logical rules and constraints, and a solver
computes answer sets---formally, stable models---that satisfy the
program's semantics.

**How it differs from imperative programming:** Rather than specifying
every step of a solution procedure, the programmer specifies the rules
of the problem and lets a solver search for solutions.

**Role in Draco:** 1. Represent visualization-design knowledge as
logical rules and constraints. 2. Search for candidate designs
consistent with the rules. 3. Exclude designs that violate hard
constraints. 4. Use optimization preferences, such as weighted soft
constraints, to rank or select designs.

**Important distinction:** ASP provides the rule-based reasoning and
solution-search mechanism. Learning soft-constraint weights from
experimental data is a separate learning component that can be combined
with this mechanism.

## 5. Learning to rank

**Definition:** Learning to rank (LTR) is a family of machine-learning
methods that learn a scoring function so that it reproduces the **order
between items**, rather than predicting an absolute score for each item.
It grew out of search engines ranking documents by relevance (Liu, 2009;
reference [36] in the paper).

### Why learn orderings instead of scores

- Absolute ground-truth labels are often hard to obtain, while relative
  comparisons ("A is better than B") are easier and more reliable.
- Visualization is a prime case: there is **no single optimal
  completion** of a partial specification, so "the correct chart for
  this query is X" training data is hard to build (§2.5).
- Perception experiments, however, naturally yield **ranked pairs**: on
  the same data and task, chart A was significantly more accurate than
  chart B.

### Three families of LTR

| Approach | Unit | What the loss measures | Examples |
|---|---|---|---|
| Pointwise | One item | Regress or classify each item's score or grade | Score regression |
| **Pairwise** | **Two items** | Zero if the pair is ordered correctly, a penalty otherwise | **RankSVM**, RankNet |
| Listwise | Whole list | Quality of the full ranking (e.g. NDCG) | ListNet, LambdaMART |

Draco uses **pairwise** RankSVM.

### Formulation in Draco

1. **Feature vector:** run Clingo on visualization v and count
   violations of each soft constraint:
   `x(v) = [n_p1(v), ..., n_pk(v)]`
2. **Linear cost model:** `Cost(v) = wᵀx(v)`; lower cost is preferred.
3. **Pairwise comparison:**
   `f(v1, v2) = Cost(v1) − Cost(v2) = wᵀ(x1 − x2)`, which turns ranking
   into **binary classification on the difference vector (x1 − x2)**.
4. **Label:** y = −1 if v1 is preferred, otherwise y = +1.
5. **RankSVM loss (hinge + L2):**
   `L = (1/n) Σ max(0, 1 − yᵢ wᵀ(xᵢ1 − xᵢ2)) + λ‖w‖²`, with λ = 0.1.
   - When v1 is preferred (y = −1), the loss is zero only if
     `Cost(v1) ≤ Cost(v2) − 1`: the preferred chart must be cheaper by
     a **margin of at least 1**.
   - The L2 term keeps weights from growing too large (overfitting).
6. **Symmetry:** (v1, v2; y) equals (v2, v1; −y), so every pair can be
   standardized to (preferred, other; −1) without class imbalance.

### Toy example

Assume only two soft constraints:
- p1: a nominal field uses color.
- p2: a nominal field uses size.

An experiment shows chart A (nominal → color) is significantly more
accurate than chart B (nominal → size).
- x_A = [1, 0], x_B = [0, 1], so d = x_A − x_B = [1, −1].
- Zero loss requires `wᵀd = w1 − w2 ≤ −1`, i.e. **w2 ≥ w1 + 1**.
- The model learns that putting a nominal field on size should cost
  more than putting it on color, with no human tuning of weights.

### From experimental data to ranked pairs (§6.3.1)

1. Group responses by (data schema, task).
2. Within each group, form every pair of visualizations.
3. Keep pairs whose accuracy or response time differs significantly
   (Fisher's test, p < 0.01).
4. Result: about 1,100 pairs from Kim & Heer and 10 from Saket et al.

### Results and significance

- Pairwise ordering accuracy on test pairs: **93% with learned
  weights** vs. 65% for hand-tuned Draco-CQL.
- Training on pairs pooled from different studies does not hurt
  performance on either, so **results from several studies can be
  integrated into one model**. This is what "extensible" in the title
  means in practice.
- New rules can start at weight 0 and be learned by retraining.

### Limitations

- **Only weights are learned;** the soft constraints (features)
  themselves are still written by experts.
- **Linear model:** interactions between features are captured only if
  a rule is written for them.
- **Pairwise accuracy ≠ best recommendation:** getting the top choice
  right matters more than ordering ranks 2 and 3, so the paper checks
  optimal encodings separately (48 + 8 conditions).
- Generalization beyond the narrow design space of the experiments
  (mostly scatterplots) is not established.

**Role in Draco:** ASP finds the best design for given weights; learning
to rank sets those weights from experimental data. Because cost is a
linear function of the feature vector, the two fit together cleanly.

## Concept map

1. **Encoding** defines a visualization design choice: how data
   attributes map to visual channels.
2. **Vega-Lite** is the grammar that writes such encodings down as
   JSON; Draco translates it into logical facts for reasoning and
   outputs its results as Vega-Lite again.
3. **Design knowledge** is formalized as constraints over such choices.
4. **Hard constraints** define valid designs; **soft constraints**
   express preferences among designs.
5. **ASP** provides a formal mechanism for finding designs that satisfy
   the rules and, together with optimization, favor designs with lower
   weighted violation costs.
6. **Learning to rank** (RankSVM) learns soft-constraint weights from
   ranked pairs ("A is better than B") harvested from experiments; the
   learned weights feed back into ASP's cost minimization.

## Questions to revisit while reading

- How does Draco represent marks, data fields, and visual channels in
  its formal language?
- How are hard and soft constraints encoded in ASP?
- What objective function and learning procedure are used to estimate
  soft-constraint weights?
- How are graphical-perception experiment results translated into
  constraints or weights?
- What are the model's limitations, and how easily can new design
  knowledge be added?

## Source links

- Paper DOI: https://doi.org/10.1109/TVCG.2018.2865240
- Author/lab page: https://idl.uw.edu/papers/draco
- Draco project: https://idl.uw.edu/draco/
  - The URL given in the paper (§1) is https://uwdata.github.io/draco/,
    which now redirects to the address above.
  - The current project page may describe later versions; keep it
    separate from the 2019 Draco content.
- **2019 Draco demo (Draco Editor):** https://idl.uw.edu/draco-editor/#/editor
  - The old address https://uwdata.github.io/draco-editor/ redirects here.
  - Why it is the 2019 Draco (checked 2026-10-11): it uses the Vega-Lite
    **v2** schema, runs clingo in the browser via WebAssembly
    (`clingo.wasm`), and ships ASP files such as `define.lp` and
    `weights.lp` with "Channel rankings à la APT" rules.
- PubMed record: https://pubmed.ncbi.nlm.nih.gov/30137004/

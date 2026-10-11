
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

### How the presentation site explains it (Part 2, Part 3)

The talk splits Vega-Lite into two steps, as the paper does: Vega-Lite
itself (§2.3) and its translation into facts (§4.1).

1. **Part 2 "a grammar that declares charts" (§2.3, §4.1):** Vega-Lite
   only. The demo shows that changing a few JSON lines (mark, fields)
   changes the chart.
2. **Part 3 "specifications as facts" (§4.1, Fig. 2):** how the same
   specification becomes ASP facts.

Data types are easiest to explain with the cars data.

| type | Meaning | cars example | Default rendering |
|---|---|---|---|
| nominal | unordered categories | `Origin` (Europe, Japan, USA) | color hues, unordered axis |
| ordinal | ordered categories | `Cylinders` (3, 4, 5, 6, 8) | ordered band axis |
| quantitative | numbers | `Horsepower`, `Miles_per_Gallon` | continuous axis; zero baseline set via scale |
| temporal | time | `Year` | time axis |

- The type sets default scales, axes, and legends, and it is also a
  condition in Draco's rules. For example, "do not use size for nominal
  data" (expressiveness, §4.2.1) is decided from the type.
- In the demo, adding `aggregate: mean` to y when the mark is bar is a
  **demo design choice** so that each bar shows one value. It is not a
  Draco rule.

**Note:** some hard constraints encode **limits of the Vega-Lite
implementation** rather than design quality. For example, Vega-Lite has
only 8 shapes, hence
`:- channel(E,shape), cardinality(E,C), C > 8.`

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

### Syntax and semantics (§3)

| Form | Name | Reading | Example |
|---|---|---|---|
| `A.` | fact (bodiless rule) | A is true | `mark(bar).` |
| `A :- L1, ..., Ln.` | rule | if every body literal is true, the head A is true | `light_on :- power_on, not broken.` |
| `not B` | negation as failure | B **cannot be derived** (not "B is proven false") | `not zero(E)` |
| `:- L1, ..., Ln.` | integrity constraint (headless rule, hard constraint) | if the body holds, contradiction; discard that answer set | `:- log(E), zero(E).` |
| `:~ L1, ..., Ln. [w]` | weak constraint (soft constraint) | each time the body holds, cost w; "prefer not to" | `:~ continuous(E), not zero(E). [5]` |
| `:~ L1, ..., Ln. [w@P,T]` | weak constraint with priority | cost w at priority level P; T is what each violation is counted per | `:~ type(E,nominal), channel(E,color), priority(E,P). [2@P,E]` |
| `l { A0; ...; An } k` | aggregate (choice) rule | at least l and at most k of the atoms are true | `1 { mark(bar); mark(line); mark(area); mark(point) } 1.` |

- **Variables** start with an uppercase letter (`E`, `C`).
  `0 { aggregate(E,count); aggregate(E,mean); ... } 1 :- encoding(E).`
  means "every encoding E has at most one aggregate" (§4.2.1).
- **Predicate notation:** following Prolog tradition, predicates are
  named by name and arity; `channel/2` is `channel` with two arguments
  (§4 footnote).
- **Answer set (stable model):** a set of atoms that is consistent with
  the constraints, justified by a derivation, and **minimal** with
  respect to unknown facts (§3). In Draco, one answer set is one
  complete visualization specification.
- **Constructive flavor:** a negative literal only needs to be true
  ("not derived"), whereas a positive one must also be provable (§3).
- **Optimal answer set:** with soft constraints, the optimal answer set
  minimizes the sum of weights of violated soft constraints (§3). ASP
  can express richer optimization such as Pareto optimality, but the
  paper says the weighted sum suffices for the linear preference models
  it learns.

### How Draco uses ASP (§4)

1. **Domains:** aggregate rules declare the values each attribute can
   take (which marks, which aggregates, ...). Supporting tick marks means
   adding `mark(tick)`.
2. **Pruning the design space:** integrity constraints remove
   ill-formed specifications (well-formedness) and ones that misrepresent
   data (expressiveness). Some reflect limits of the Vega-Lite
   implementation.
3. **Preferences:** soft constraints define the evaluation function
   **implicitly**. Costs are integers and impose a total order on the
   design space (§4.2.2).
4. **Query and solve:** the user's data, partial specification, and task
   become facts and rules, are combined with the knowledge base, and
   Clingo finds the optimal answer set, which Draco translates back into
   a Vega-Lite specification (§4.3).
5. **Features for learning:** running Clingo on a complete specification
   and counting each soft constraint's violations gives its feature
   vector x (§5).

### Clingo

- The solver used by the 2019 Draco. It uses conflict reasoning and
  heuristics to guide search and solves problems with up to millions of
  variables (§2.4).
- The paper does not describe Clingo's internal optimization algorithm;
  it points to the Potassco Clingo guide for the language and solver.

### Why ASP (the paper's reasons)

- **Well-defined semantics and efficient domain-independent algorithms**
  (§1): finding good encodings becomes finding optimal answer sets.
- **Separating knowledge from search** (§2.4, §4): designers declare
  knowledge and leave search to the solver. Imperative generate-and-test
  systems such as CompassQL waste resources enumerating infeasible
  candidates and are hard to change.
- **Balance of expressivity, efficiency, and ease of use** (§2.4), with
  prior use in decision support, product configuration, and educational
  game design.
- **Fits the learning step:** cost is linear in violation counts, so
  weights learned by RankSVM plug straight in (§5).

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

Draco uses **pairwise** RankSVM. Its formulation and an example are in section 6.

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

## 6. RankSVM

**Definition:** RankSVM is a pairwise learning-to-rank method that
applies a support vector machine (SVM) to pairwise comparisons (Herbrich
et al., 1999; reference [27] in the paper). All soft-constraint weights
in Draco-Learn are learned with it (§5, §6.3).

### Why it matters

- One of the paper's two contributions, "a method to learn weights for
  soft constraints from experimental data" (Abstract), is this step.
- The difference between Draco-CQL (hand-tuned weights) and Draco-Learn
  (learned weights), 93% vs. 65% test-pair accuracy and the task-specific
  recommendations in Fig. 8, comes from it (§6.3).
- The learned w becomes the ASP soft-constraint weights directly.
  Inference (ASP) and learning (RankSVM) share one linear cost model.

### SVM basics [background, outside the paper]

- A linear SVM finds the separating hyperplane with the largest margin to
  the data on both sides.
- **Hinge loss** `max(0, 1 − y·s)`: zero if the score s is on the correct
  side by at least 1, otherwise a penalty for the shortfall. A correct
  side with a margin below 1 is still penalized.
- **L2 term** `λ‖w‖²`: keeps w small, which is equivalent to widening the
  margin and reduces overfitting. Larger λ gives smaller, smoother
  weights; smaller λ fits the training data more closely.
- Only pairs near the boundary or misclassified (support vectors) move
  the solution; pairs already ranked with room to spare do not.

### Turning ranking into classification (§5)

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

Assume only two soft constraints. (Size is not used: putting a nominal
field on size violates a hard constraint, §4.2.1.)
- p1: a nominal field uses color.
- p2: a nominal field uses shape.

An experiment shows chart A (nominal → color) is significantly more
accurate than chart B (nominal → shape).
- x_A = [1, 0], x_B = [0, 1], so d = x_A − x_B = [1, −1].
- Zero loss requires `wᵀd = w1 − w2 ≤ −1`, i.e. **w2 ≥ w1 + 1**.
- The model learns that putting a nominal field on shape should cost
  more than putting it on color, with no human tuning of weights.

### Training setup (§5, §6.3)

- **Features:** Draco-CQL's soft constraints plus rules describing the
  design spaces of the Kim et al. and Saket et al. studies. New rules
  start at weight 0.
- **Training:** a classifier on the difference of each pair's feature
  vectors, using an off-the-shelf SVM from scikit-learn. λ = 0.1 is the
  value "for our initial experiments".
- **Split:** 55% training, 15% validation, 30% test.
- **Results:**
  - 93% test-pair accuracy (hand-tuned Draco-CQL: 65%, only slightly
    better than chance).
  - 100% training accuracy on the Saket et al. data even with all Kim et
    al. data included; pooling studies did not hurt either one.
  - 96% validation accuracy when the harvesting threshold is relaxed to
    p < 0.1.
  - Test accuracy falls significantly behind validation accuracy only
    below 250 training pairs, which the paper reads as redundancy in the
    data and evidence that the model generalizes.
  - In all 48 (Kim et al.) and 8 (Saket et al.) conditions, Draco-Learn
    returns a top-performing encoding.

### Reading learned weights

- A larger weight means a larger penalty. What sets the ranking is the
  **relative difference** between weights, not their absolute size.
- If compared charts always have the same total number of violations,
  adding a constant to every weight leaves every comparison unchanged;
  the L2 term then picks a solution near zero, so negative weights can
  appear (site demo, Part 9). A negative weight means the violation is
  actually preferred. The paper does not discuss the sign of learned
  weights. **[unstated]**
- Clingo uses integer costs, but the paper does not say how real-valued
  weights are converted. **[unstated]**

### MLN interpretation (§2.5, §4.2.2, Appendix)

- Draco's preference model forms a Markov logic network (MLN): soft
  constraints are logical formulas and weights are their learnable
  parameters.
- Finding the optimal completion is MAP inference in the MLN. Because
  the ASP solver minimizes cost directly, the partition function never
  has to be computed.

### Limitations (RankSVM view)

- **Linear model:** feature interactions are captured only if a rule is
  written for them.
- **Imprecise wording:** the paper says "linear regression ... minimizing
  the hinge loss", but minimizing hinge loss is linear classification,
  not regression (recorded in `docs/01_paper/04_critical-review.md`).
- **No comparison with other ranking methods** such as RankNet or
  LambdaMART. **[unstated]**

## 7. Preparing for questions after the talk: Vega-Lite, ASP, RankSVM

Source tags: **[paper §]** = supported by the paper, **[background]** =
general knowledge outside the paper (say so when answering),
**[unstated]** = the paper does not say (do not fill it in by guessing).

### Vega-Lite

**Q. How is Vega-Lite different from Vega or D3?**
A. D3 is a JavaScript library where code spells out how to draw. Vega is
a declarative grammar above that, and Vega-Lite is a higher-level grammar
above Vega; Vega-Lite specifications compile to Vega. **[background]**
In the Draco paper, Vega-Lite is both what Draco reasons about and its
output language. **[§2.3, Fig. 1]**

**Q. Why Vega-Lite and not ggplot2 or Tableau?**
A. The paper gives three reasons: Vega-Lite was designed to support
search and inference over possible visualizations **[§2.3]**; CompassQL
already used a logical representation of Vega-Lite **[§2.3]**; and APT's
graphical algebra is no longer used, while Vega-Lite is a more complete
graphical language **[§2.1]**. Its JSON format is also easy for programs
to generate and edit. **[background]**

**Q. Why convert JSON into facts instead of using it directly?**
A. An ASP solver reasons only over facts and rules. Flattening nested
JSON into facts like `mark(bar).` and `channel(e0,x).` lets rules refer
generally to "any encoding E". Generalizing to `channel(E,C)` instead of
one predicate per channel allows the detail channel to be used several
times and makes channel-independent rules easy to write. **[§4.1]** The
resulting answer set is translated back into Vega-Lite. **[§4.3]**

**Q. Does Draco recommend layers, concatenation, or interaction?**
A. No. The 2019 paper covers single views and row/column facets only.
**[§2.3]** Interaction such as Vega-Lite selections is mentioned only as
a future extension. **[§7.2]**

**Q. Which Vega-Lite version did the 2019 Draco use?**
A. The paper does not say. **[unstated]** The 2019 Draco Editor uses the
Vega-Lite v2 schema (checked 2026-10-11). The presentation site renders
with the current Vega-Lite and uses only features that existed in v2.

**Q. Why distinguish nominal from ordinal?**
A. Whether values have an order changes which encodings fit. Cylinders
(3, 4, 5, 6, 8) is ordinal; Origin (Europe, Japan, USA) is nominal. The
type sets Vega-Lite's default scales and legends and is a condition in
Draco's rules. For example, size implies an order, so it is not used for
nominal data. **[§4.2.1]**

### ASP

**Q. How is ASP different from Prolog?**
A. Both are logic programming, but they run differently. Prolog proves
one query top-down in rule order, and rule order affects results and
termination. ASP first grounds the whole program (removes variables) and
then a solver searches for answer sets; rule order does not matter, and
optimization (weak constraints) is part of the language.
**[background]** The paper mentions only the Prolog convention of naming
predicates by name/arity. **[§4 footnote]**

**Q. Why ASP and not SAT, integer programming, or machine learning?**
A. The paper cites well-defined semantics and efficient
domain-independent algorithms **[§1]**, separating declared knowledge
from solver search **[§2.4]**, and a balance of expressivity, efficiency,
and ease of use **[§2.4]**. Pure machine learning would need pairs of
incomplete specifications and optimal completions, which do not exist
for visualization because there is no single correct answer; so the
rules are written in ASP and only the weights are learned from ranked
pairs. **[§2.5]** There is no experimental comparison with SAT or integer
programming. **[unstated]**

**Q. Is `not` in a rule the same as logical negation?**
A. No. In ASP, `not B` means "B cannot be derived" (negation as failure).
In `light_on :- power_on, not broken.`, light_on holds if there is no
derivation of broken. **[§3]** So `:~ continuous(E), not zero(E). [5]`
reads "cost 5 if a field is continuous and there is no fact saying its
scale includes zero".

**Q. What exactly is an answer set?**
A. A minimal set of facts that is consistent with the rules, in which
every true atom has a derivation and nothing unjustified is assumed true
(a stable model). **[§3]** In Draco, one answer set is one complete chart
specification.

**Q. Does Clingo generate every candidate and then pick one?**
A. No. It uses conflict reasoning and heuristics to guide search and
handles problems with millions of variables. **[§2.4]** This contrasts
with CompassQL's generate-and-test: Draco answered a 25-field,
5-encoding query in under 0.5 s, while CompassQL ran out of memory after
minutes. **[§6.2]** Internally it grounds the program and then keeps
finding cheaper solutions, tightening the bound until it proves
optimality. **[background]** The paper does not describe this algorithm.
**[unstated]**

**Q. What if several answers tie for optimal?**
A. In the paper, "optimal" means no other visualization would be scored
as preferred under the defined preferences. **[§4]** How ties are broken
is not stated. **[unstated]** Enumerating top-scoring designs and
re-ranking them with another classifier is proposed as future work.
**[§7.1]**

**Q. Clingo costs are integers, but aren't learned weights real numbers?**
A. The paper says only that the evaluation function maps a specification
to an integer **[§4.2.2]**; it does not say how RankSVM's real-valued
weights are turned into integers. **[unstated]** Scaling and rounding is
the usual approach, but that is general practice, not the paper.
**[background]**

**Q. Is the cost an average of weights?**
A. It is a sum: Cost(v) = Σ wᵢ · nᵢ(v), where nᵢ(v) counts violations of
the i-th soft constraint. Both w and x = [n₁(v), ..., n_k(v)] are
k-dimensional (k = number of soft constraints), so Cost = wᵀx.
**[§4.2.2, §5]**

**Q. What does `[2@P,E]` mean in the Draco-APT rules?**
A. `w@P` assigns cost w at priority level P. The solver first satisfies
all hard constraints and then considers soft constraints level by level.
Draco-APT sets P to the field's importance, reproducing APT's principle
that more important fields get the more effective channels. **[§6.1]**
The trailing `E` makes violations count separately per encoding.
**[background]** Draco-Learn, with learned weights, uses a single
weighted sum. **[§5]**

**Q. How do you decide whether a rule is hard or soft?**
A. If violating it makes the chart invalid (ungrammatical) or misleading,
it is hard; if it is a matter of degree, it is soft. Some hard
constraints reflect limits of the Vega-Lite implementation rather than
design quality (e.g., at most 8 shapes). **[§4.2.1]**

**Q. Does this presentation site compute its costs with Clingo?**
A. No. The site borrows only Draco's cost model (sum of violation count ×
weight) and computes it directly in TypeScript. Its constraints and
weights are hand-tuned for the site, not the paper's knowledge base.

### RankSVM

**Q. How important is RankSVM to Draco?**
A. One of the paper's two contributions is a method to learn weights from
experimental data (Abstract), and that method is RankSVM. **[§5]** The gap
between hand-tuned (Draco-CQL) and learned (Draco-Learn) weights, 93% vs.
65% test-pair accuracy, comes from this step. **[§6.3]**

**Q. Why RankSVM and not a neural ranking model?**
A. Draco's cost is linear in violation counts, so a linear pairwise model's
coefficients are exactly the soft-constraint weights, which stay readable
and editable per rule. **[§5]** There is no experimental comparison with
other ranking methods. **[unstated]**

**Q. The paper says "linear regression". Is it regression?**
A. No. Minimizing hinge loss is linear classification of the sign of the
difference vector. The wording is imprecise, and the review lists it among
notation issues. **[§5, reviewer's opinion]**

**Q. If every pair is standardized to y = −1, there is only one class. Can
an SVM still be trained?**
A. The paper's loss has no bias term, so it is symmetric about the origin,
and the paper argues that standardizing all pairs to (preferred, other;
−1) causes no problem. **[§5]** Standard scikit-learn classifiers usually
need two classes, though, and the paper does not say how this was handled
(e.g., flipping some pairs or disabling the intercept). **[unstated;
scikit-learn behavior is background]**

**Q. How should a negative weight be read?**
A. Violating that rule is actually preferred. When compared charts have
equal total violations, only relative differences matter, so L2
regularization picks values near zero and some can be negative.
**[background]** The paper does not discuss the sign of learned weights.
**[unstated]**

**Q. How much training data was needed?**
A. About 1,100 pairs from Kim & Heer and 10 from Saket et al. **[§6.3.1]**
Test accuracy drops significantly only below 250 training pairs. **[§6.3]**

**Q. Isn't 93% overfitting?**
A. It is measured on a held-out 30% test split (55% train, 15% validation),
so it is not overfitting to the training pairs. **[§6.3]** But the test
pairs come from the same experiments, so it does not show performance
outside their narrow design space (mostly scatterplots). **[reviewer's
opinion]**

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

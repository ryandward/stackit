<p align="center">
  <img src="logo.svg" alt="stackit" width="120">
</p>

<h1 align="center">stackit</h1>
<p align="center"><strong>The instantaneous derivative of every well plate you have ever loaded.</strong></p>


***

[stackit](https://stackit.bio) is a high throughput cross filter substrate for assay data. Plate goes in. Brush goes across. Heatmap comes out. Everything in between is a sequence of functorial selections over a category of measurable subsets. You will not encounter a spinner.

Site is live at [stackit.bio](https://stackit.bio).

## Roadmap: The Cross Filter Substrate

stackit is built on the principle that data exploration is mathematically a sequence of subset morphisms. We do not present a UI. We present a projection. The interaction surface is entirely derived from the spectral decomposition of the sample similarity matrix. The frontend is irrelevant. It is a mathematically derived projection layer that syncs with the backend over Arrow IPC frames while DuckDB acts as the universal query engine. It is augmented with pgvector for high dimensional embeddings of canonical assay phenotypes and a critically damped spring lattice for the cross filter brush.

### Pipeline

pgvector sidecar for cosine sim. canvas runs the spring solver per rAF. the formal treatment is below.

```text
   plate layout, assay telemetry, sample annotation graph
                                  |
                                  v
                       ingestion + stack builder
                                  |
                                  v
              THE CROSS FILTER SUBSTRATE (DuckDB + Arrow IPC)
                                  |
       +--------------------------+--------------------------+
       |                          |                          |
       v                          v                          v

   subset morphisms       spring lattice solver       metric embedder
   (categorical)          (critically damped)         (pgvector)

   brush selections       inhomogeneous wave eq.      per feature L2 norm
   modeled as functors    on bin height field         approximate nearest
   on powerset 2^Ω        solved per frame 60Hz       neighbor on samples

       |                          |                          |
       +--------------------------+--------------------------+
                                  |
                                  v
                  brushed histogram lattice  -->  heatmap projection map

                  B_H : 2^Ω -> 2^Ω,    B_H(S) = { ω ∈ S : φ_H(ω) ∈ I }
                  the brush is the selector functor on the powerset of samples
                                  |
                                  v
              mathematically derived heatmap  <-->  spring animated UI
```

### 1. The brush is a morphism not a UI element

When you drag a rectangular selection across the first histogram in stackit you are not interacting with a chart. You are emitting a functor on the powerset of samples. Every other histogram in the cross filter lattice is the image of that functor under its own observation map. The spring physics is the damped recovery of the metric embedding back to the new equilibrium. Formally:

$$B_{H_1}: 2^{\Omega} \to 2^{\Omega}, \quad B_{H_1}(S) = \\{ \omega \in S \mid \varphi_{H_1}(\omega) \in I \\}$$

The point is your filter selection commutes with every observation map. So you do not compute. You select. The lattice does the rest.

> Drop the brush. The bars settle. You see the pattern.

You know this because the projection updates synchronously with the brush extent. See, the surviving subset under the brush is the limit of a sequence of functorial restrictions and the heatmap is the L2 projection of that limit onto a single carrier hue. Stackit traverses the sample annotation graph and computes the cosine similarity of every surviving sample weighted by the spectral decomposition of the assay covariance:

$$\text{sim}(s_i, s_j) = \frac{\langle \mathbf{v}_i, \mathbf{v}_j \rangle}{\\|\mathbf{v}_i\\| \\|\mathbf{v}_j\\|} \otimes \mathcal{H}(\Sigma)$$

When the brush moves the substrate recomputes the limit and emits an Arrow IPC delta to the client. The nearest neighbor algorithm proves your survivor set bridges the gap to the canonical phenotype so the heatmap literally tells you which wells to follow up on next plate.

### 2. Spring animated cross filter as an inhomogeneous wave equation

The bars in stackit do not tween. Each bin height $h_i(t)$ obeys:

$$\ddot{h}_i + 2\zeta\omega_n \dot{h}_i + \omega_n^2 (h_i - h_i^{\\*}) = 0$$

with $h_i^{\\*}$ the equilibrium height under the current brush extent. We solve it semi implicitly per frame at 60Hz. The damping ratio is 0.78 because anything tighter feels mechanical and anything looser feels uncertain. The result is that your filter is not a click event it is a continuous physical perturbation of the metric embedding and your eye reads it as such.

### 3. Heatmap as a single hue amplitude projection

The output heatmap is not a visualization. It is the L2 projection of the surviving subset onto a single carrier hue. Variety becomes amplitude. Categorical contrast is rejected as a confound. There is exactly one channel of information and it modulates intensity only. We use this same constraint we use in our genomics platform because contrast bandwidth is conserved and decorative color robs signal.

## Mathematically derived UI

The hero animation on stackit.bio is a system of 24 instances each rendered as a single rounded rect primitive whose six parameters spring between three named keyframes. There is no React. There is no Tailwind. There is one canvas tag and a 12 second loop. The frontend design entirely avoids third party component bloat relying instead on a mathematically derived design system mapped strictly to CSS variables. If your machine cannot solve 24 simultaneous spring equations at 60Hz I do not know what to tell you.

## Execution

```bash
git clone https://github.com/ryandward/stackit
cd stackit
python3 -m http.server 8000
```

There is no install. If you cant figure this out you probably should not be cloning this repo.

## Status

Site is live at [stackit.bio](https://stackit.bio). Implementation surface is currently one `index.html` and a single sentence on a black background. The architecture above is the strict roadmap. The placeholder is not a limitation. It is a deliberate compression. You can not even handle what is next.

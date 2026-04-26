import { useState } from 'react'
import { Users, Star, Trophy, MessageCircle, ThumbsUp, TrendingUp } from 'lucide-react'

const reviews = [
  { id: 1, author: 'Rahul M.', car: 'Tata Nexon', rating: 5, date: 'Mar 2024', text: 'Best car in this segment for safety! 5-star NCAP and ADAS makes it a no-brainer. Highly recommended for families.', likes: 142 },
  { id: 2, author: 'Priya S.', car: 'Hyundai Creta', rating: 4, date: 'Feb 2024', text: 'Dual curved screen is stunning. Turbo DCT is powerful but slightly jerky in stop-and-go. Overall very impressed.', likes: 98 },
  { id: 3, author: 'Vikram J.', car: 'Mahindra XUV700', rating: 5, date: 'Jan 2024', text: 'Night vision, AWD, 7 seats — at this price!? Incredible value. The diesel torque is addictive on highways.', likes: 231 },
  { id: 4, author: 'Ananya R.', car: 'Honda City', rating: 4, date: 'Mar 2024', text: 'Honda Sensing ADAS is the best in this class. Smooth CVT, spacious cabin, and 5-star safety. City is a complete package.', likes: 87 },
  { id: 5, author: 'Karan P.', car: 'BMW X1', rating: 5, date: 'Feb 2024', text: 'The curved display and build quality are in a different league. Handling is fantastic. Worth every rupee.', likes: 76 },
  { id: 6, author: 'Sneha T.', car: 'Tata Tiago EV', rating: 4, date: 'Jan 2024', text: 'Best budget EV in India. Running cost is just ₹0.80/km vs ₹6+ for petrol. The AC quick charge at shopping malls is super convenient.', likes: 113 },
]

const leaderboard = [
  { rank: 1, car: 'Mahindra XUV700',  score: 98, category: 'Best Value' },
  { rank: 2, car: 'Tata Nexon',        score: 96, category: 'Best Safety' },
  { rank: 3, car: 'Hyundai Creta',     score: 94, category: 'Best Features' },
  { rank: 4, car: 'Honda City',         score: 92, category: 'Best Sedan' },
  { rank: 5, car: 'Maruti Swift',       score: 91, category: 'Best Mileage' },
]

const discussions = [
  { id: 1, title: 'Nexon EV Max vs BYD Atto 3 — which is the better long-range EV?', replies: 47, views: 1240, hot: true },
  { id: 2, title: 'DCT vs AMT — which is more suitable for Bangalore traffic?', replies: 31, views: 890 },
  { id: 3, title: 'Toyota Fortuner vs Mahindra XUV700 for highway + weekend trips', replies: 88, views: 2300, hot: true },
  { id: 4, title: 'First car under ₹10L — Baleno vs i20 vs Swift?', replies: 62, views: 1800 },
]

export default function Community() {
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set())

  const toggleLike = (id: number) => {
    setLikedReviews(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="page-enter section-wrapper py-10">
      {/* Header */}
      <div className="mb-8">
        <span className="section-tag mb-3"><Users className="w-3.5 h-3.5" /> Community</span>
        <h1 className="text-display-md">Community Hub</h1>
        <p className="text-text-muted mt-1">Real owner reviews, discussions, and the top cars ranked by community.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Reviews */}
        <section className="lg:col-span-2" id="reviews" aria-label="Owner Reviews">
          <div className="flex items-center gap-3 mb-5">
            <Star className="w-5 h-5 text-warning" />
            <h2 className="text-display-xs">Owner Reviews</h2>
          </div>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} id={`review-${review.id}`} className="glass rounded-2xl p-5 group hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-text-primary">{review.author}</p>
                    <p className="text-xs text-accent">{review.car} · <span className="text-text-dim">{review.date}</span></p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-warning fill-warning' : 'text-border'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{review.text}</p>
                <button
                  id={`like-review-${review.id}`}
                  onClick={() => toggleLike(review.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    likedReviews.has(review.id) ? 'text-accent' : 'text-text-dim hover:text-accent'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${likedReviews.has(review.id) ? 'fill-accent' : ''}`} />
                  {review.likes + (likedReviews.has(review.id) ? 1 : 0)} helpful
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Leaderboard */}
          <section id="leaderboard" className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-warning" />
              <h3 className="font-bold text-text-primary">Community Leaderboard</h3>
            </div>
            <div className="space-y-3">
              {leaderboard.map(entry => (
                <div key={entry.rank} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    entry.rank === 1 ? 'bg-warning/20 text-warning' :
                    entry.rank === 2 ? 'bg-text-muted/20 text-text-muted' :
                    'bg-warm/20 text-warm'
                  }`}>{entry.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{entry.car}</p>
                    <p className="text-xs text-text-dim">{entry.category}</p>
                  </div>
                  <span className="text-sm font-bold text-accent shrink-0">{entry.score}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Hot discussions */}
          <section id="forum" className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-text-primary">Hot Discussions</h3>
            </div>
            <div className="space-y-3">
              {discussions.map(d => (
                <div key={d.id} className="pb-3 border-b border-border/30 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2 mb-1">
                    {d.hot && <span className="text-[10px] font-bold text-warm bg-warm/10 border border-warm/30 rounded-full px-1.5 py-0.5 shrink-0 mt-0.5">🔥</span>}
                    <p className="text-xs font-medium text-text-secondary leading-relaxed">{d.title}</p>
                  </div>
                  <div className="flex gap-3 text-[11px] text-text-dim">
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{d.replies}</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{d.views.toLocaleString()} views</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

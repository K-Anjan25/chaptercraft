import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, ArrowUp, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown,
  ChevronLeft, ChevronRight, Compass, Menu, Search, Star, X,
} from 'lucide-react';
import './index.css';

type Book = {
  id: string;
  title: string;
  author: string;
  genre: 'Fiction' | 'Mindful living' | 'Adventure';
  cover: string;
  dark: boolean;
  description: string;
};

type Plan = 'Free' | 'Plus';

const books: Book[] = [
  { id: 'quiet', title: 'The Quiet Between', author: 'Nora Vale', genre: 'Fiction', cover: '/images/cover-quiet.jpg', dark: true,
    description: 'A tender story about the spaces between who we were and who we are becoming. For anyone who has ever found a new beginning in an unexpected place.' },
  { id: 'light', title: 'Where the Light Goes', author: 'Elena Hart', genre: 'Fiction', cover: '/images/cover-light.jpg', dark: false,
    description: 'A luminous journey through love, loss, and the places that call us home. The kind of book you will want to tell a friend about.' },
  { id: 'garden', title: 'The Little Garden', author: 'Mira Solis', genre: 'Fiction', cover: '/images/cover-garden.jpg', dark: false,
    description: 'In a forgotten garden, a small community learns that growing something new often means making room for one another.' },
  { id: 'sea', title: 'Elsewhere, by the Sea', author: 'Theo Laurent', genre: 'Adventure', cover: '/images/cover-sea.jpg', dark: false,
    description: 'A slow, salt-air adventure about setting out without a map and finding exactly what you did not know you needed.' },
  { id: 'slow', title: 'The Art of Slowing Down', author: 'June Ellis', genre: 'Mindful living', cover: '/images/cover-slow.jpg', dark: false,
    description: 'A gentle invitation to notice more, rush less, and make room for the everyday moments that matter most.' },
  { id: 'stars', title: 'Under a Thousand Stars', author: 'Amara Reed', genre: 'Adventure', cover: '/images/cover-stars.jpg', dark: true,
    description: 'An unforgettable journey beneath wide night skies, where the way forward begins with looking up.' },
];

const filters = ['All books', 'Fiction', 'Mindful living', 'Adventure'] as const;
type Filter = (typeof filters)[number];

const testimonials = [
  { quote: 'It feels like the little bookshop I always wished I had, only it knows exactly what I love to read.', name: 'Maya R.', detail: 'Weekend reader' },
  { quote: 'I used to have book lists everywhere. Now the stories I want to read finally have a home.', name: 'Jordan L.', detail: 'Book club regular' },
  { quote: 'The first reading app that makes me want to put my phone down and pick a book up.', name: 'Aisha K.', detail: 'One-more-chapter reader' },
];

const faqs = [
  { question: 'What is My library?', answer: 'My library is a personal home for your reading life. Discover new books, keep a thoughtful list of what you want to read, and collect the stories you want to remember, all in one calm place.' },
  { question: 'Can I use My library for free?', answer: 'Yes. The Free plan lets you discover books, save up to 30 titles, and keep track of what you are reading. You can move to Plus whenever you want more room for your shelves.' },
  { question: 'Can I add books I already own?', answer: 'Absolutely. Your shelves are for every book in your reading life, whether it is on your nightstand, on an e-reader, or still on your wish list.' },
  { question: 'Does My library include ebooks?', answer: 'My library is a reading companion, not an ebook subscription. It helps you discover and organize books; reading copies are obtained from your library, bookstore, or preferred ebook provider.' },
  { question: 'Can I change or cancel my plan?', answer: 'Yes. You can change your plan whenever you need to. Your saved books and reading history stay yours, even if you return to the Free plan.' },
];

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.78, delay, ease }}>
      {children}
    </motion.div>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand ${light ? 'brand-light' : ''}`} href="#top" aria-label="My library, back to top">
      <BookOpen className="brand-icon" size={25} strokeWidth={1.45} aria-hidden="true" />
      <span>my library<span className="brand-period">.</span></span>
    </a>
  );
}

function Dialog({ children, onClose, labelledBy, className = '' }: {
  children: ReactNode; onClose: () => void; labelledBy: string; className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      const preferred = dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      const fallback = dialogRef.current?.querySelector<HTMLElement>('input, button');
      (preferred ?? fallback)?.focus();
    }, 60);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { closeRef.current(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div ref={dialogRef} className={`dialog-panel ${className}`} role="dialog" aria-modal="true"
        aria-labelledby={labelledBy} initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0 : 0.36, ease }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function App() {
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('All books');
  const [savedOnly, setSavedOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('my-library-saved') || '[]');
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
    } catch { return []; }
  });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [signupPlan, setSignupPlan] = useState<Plan | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState('');
  const shelfRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 42);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { localStorage.setItem('my-library-saved', JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [mobileOpen]);
  useEffect(() => { if (signupSuccess) successHeadingRef.current?.focus(); }, [signupSuccess]);

  const visibleBooks = books.filter((book) => {
    const matchesFilter = filter === 'All books' || book.genre === filter;
    const matchesShelf = !savedOnly || savedIds.includes(book.id);
    const matchesQuery = `${book.title} ${book.author} ${book.genre}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesShelf && matchesQuery;
  });

  function scrollTo(id: string) {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function resetShelfScroll() {
    window.requestAnimationFrame(() => shelfRef.current?.scrollTo({ left: 0, behavior: 'auto' }));
  }
  function browseBooks() {
    setSavedOnly(false); setFilter('All books'); setQuery(''); resetShelfScroll(); scrollTo('library');
  }
  function toggleSave(book: Book) {
    const isSaved = savedIds.includes(book.id);
    setSavedIds((current) => isSaved ? current.filter((id) => id !== book.id) : [...current, book.id]);
    setToast(isSaved ? `Removed ${book.title} from your shelf` : `Saved ${book.title} to your shelf`);
  }
  function openSignup(plan: Plan = 'Free') {
    setMobileOpen(false); setSelectedBook(null); setSignupSuccess(false); setSignupPlan(plan);
  }
  function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem('my-library-profile', JSON.stringify({ name: name.trim(), email: email.trim(), plan: signupPlan }));
    setSignupSuccess(true);
  }
  function chooseFilter(nextFilter: Filter) {
    setFilter(nextFilter);
    resetShelfScroll();
  }
  function showDiscover() { setSavedOnly(false); setFilter('All books'); setQuery(''); resetShelfScroll(); }
  function showShelf() { setSavedOnly(true); setFilter('All books'); setQuery(''); resetShelfScroll(); }
  function moveTestimonial(direction: number) {
    setTestimonialIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  return (
    <div id="top" className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`site-header ${scrolled || mobileOpen ? 'header-scrolled' : ''}`}>
        <div className="page-container header-inner">
          <Brand light={!scrolled && !mobileOpen} />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#library">Explore</a><a href="#features">Why My library</a>
            <a href="#testimonials">Reader stories</a><a href="#pricing">Membership</a>
          </nav>
          <div className="header-actions">
            <button className="header-search" type="button" aria-label="Search the library" onClick={() => {
              browseBooks(); window.setTimeout(() => searchRef.current?.focus(), reduceMotion ? 0 : 650);
            }}><Search size={19} strokeWidth={1.8} aria-hidden="true" /></button>
            <button className="header-cta" type="button" onClick={() => openSignup('Free')}>
              Start your library <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            <button className="mobile-menu-button" type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen} aria-controls={mobileOpen ? 'mobile-navigation' : undefined} onClick={() => setMobileOpen((open) => !open)}>
              {mobileOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }} transition={{ duration: reduceMotion ? 0 : 0.28 }}>
            <a href="#library" onClick={() => setMobileOpen(false)}>Explore</a>
            <a href="#features" onClick={() => setMobileOpen(false)}>Why My library</a>
            <a href="#testimonials" onClick={() => setMobileOpen(false)}>Reader stories</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)}>Membership</a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQs</a>
            <button type="button" onClick={() => openSignup('Free')}>Start your library <ArrowUpRight size={18} aria-hidden="true" /></button>
          </motion.nav>}
        </AnimatePresence>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-visual" aria-hidden="true"><img src="/images/library-hero.jpg" alt="" fetchPriority="high" /></div>
          <div className="hero-shade" aria-hidden="true" />
          <div className="page-container hero-content"><div className="hero-copy">
            <motion.p className="hero-eyebrow" initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1, ease }}>
              A NEW HOME FOR YOUR READING LIFE
            </motion.p>
            <motion.h1 id="hero-title" initial={reduceMotion ? false : { opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.18, ease }}>
              my <em>library.</em>
            </motion.h1>
            <motion.p className="hero-description" initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.35, ease }}>
              A beautiful place for the books you love, the stories you will find, and every chapter in between.
            </motion.p>
            <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.48, ease }}>
              <button className="button button-cream" type="button" onClick={browseBooks}>Explore the library <ArrowUpRight size={18} aria-hidden="true" /></button>
              <button className="hero-text-link" type="button" onClick={() => openSignup('Free')}>Start your shelf <ArrowRight size={18} aria-hidden="true" /></button>
            </motion.div>
          </div></div>
        </section>

        <section className="proof-section" aria-label="Reader love"><div className="page-container proof-inner">
          <Reveal className="proof-intro"><span className="section-kicker">A PLACE TO BELONG</span><p>For the people who always have a book nearby.</p></Reveal>
          <Reveal className="proof-quote" delay={0.12}>
            <div className="proof-stars" role="img" aria-label="Five out of five stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill="currentColor" strokeWidth={1} aria-hidden="true" />)}</div>
            <blockquote>"My to-read list finally feels like a place I want to be."</blockquote><span className="proof-attribution">A note from an early reader</span>
          </Reveal>
        </div></section>

        <section id="features" className="features-section section-spacing" aria-labelledby="features-title"><div className="page-container features-layout">
          <Reveal className="features-intro"><span className="section-kicker">THE READING EXPERIENCE / 01</span>
            <h2 id="features-title" className="section-title">Everything you love about books, <em>beautifully together.</em></h2>
            <p className="section-description">Less searching through lists. More following the stories that speak to you.</p>
          </Reveal>
          <div className="feature-list">{[
            { number: '01', title: 'Discover with intention', description: 'Thoughtful finds for your mood, your curiosity, and your next free afternoon.' },
            { number: '02', title: 'Keep every book close', description: 'One lovely place for what you are reading, what you loved, and what is next.' },
            { number: '03', title: 'Make it your own', description: 'Create a reading space that feels less like a list and more like you.' },
          ].map((feature, index) => <Reveal className="feature-row" key={feature.number} delay={index * 0.1}>
            <span className="feature-number">{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div>
            <ArrowUpRight size={19} strokeWidth={1.5} aria-hidden="true" />
          </Reveal>)}</div>
        </div></section>

        <section id="library" className="showcase-section section-spacing" aria-labelledby="showcase-title"><div className="page-container">
          <div className="showcase-intro"><Reveal><span className="section-kicker">A LOOK INSIDE / 02</span>
            <h2 id="showcase-title" className="section-title">Your shelf, <em>your story.</em></h2></Reveal>
            <Reveal delay={0.1}><p className="section-description">Wander a little. Save what catches your eye. Your next favorite might be right here.</p></Reveal>
          </div>
          <Reveal className="library-window" delay={0.1}>
            <div className="window-bar"><span className="window-brand"><BookOpen size={17} strokeWidth={1.5} aria-hidden="true" /> my library.</span>
              <span className="window-bar-note">A QUIETER CORNER OF THE INTERNET</span><span className="window-dots" aria-hidden="true"><i /><i /><i /></span></div>
            <div className="library-body"><aside className="library-sidebar" aria-label="Library preview navigation">
              <span className="sidebar-label">YOUR SPACE</span>
              <button className={!savedOnly ? 'sidebar-active' : ''} type="button" onClick={showDiscover}><Compass size={17} strokeWidth={1.7} aria-hidden="true" /> Discover</button>
              <button className={savedOnly ? 'sidebar-active' : ''} type="button" onClick={showShelf}><Bookmark size={17} strokeWidth={1.7} aria-hidden="true" /> My shelf <span className="shelf-count">{savedIds.length}</span></button>
              <div className="sidebar-rule" /><span className="sidebar-label">EXPLORE BY MOOD</span>
              <button type="button" onClick={() => { setSavedOnly(false); chooseFilter('Fiction'); }}>Fiction</button>
              <button type="button" onClick={() => { setSavedOnly(false); chooseFilter('Mindful living'); }}>Mindful living</button>
              <button type="button" onClick={() => { setSavedOnly(false); chooseFilter('Adventure'); }}>Adventure</button>
              <p className="sidebar-note">Good books deserve<br />a good place to live.</p>
            </aside>
            <div className="library-content">
              <div className="library-content-top"><div><span className="library-overline">{savedOnly ? 'BOOKS YOU HAVE KEPT' : 'HANDPICKED FOR YOUR CURIOSITY'}</span>
                <h3>{savedOnly ? 'Your saved shelf.' : 'Find your next favorite.'}</h3></div>
                <label className="library-search"><Search size={17} strokeWidth={1.8} aria-hidden="true" /><span className="sr-only">Search books</span>
                  <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books..." /></label>
              </div>
              <div className="library-filters" role="group" aria-label="Filter books by genre">{filters.map((item) => <button key={item} className={filter === item ? 'filter-active' : ''}
                type="button" aria-pressed={filter === item} onClick={() => chooseFilter(item)}>{item}</button>)}</div>
              {visibleBooks.length > 0 ? <div className="book-shelf" ref={shelfRef} role="region" aria-label="Books to explore" tabIndex={0}>
                {visibleBooks.map((book) => <article className="book-item" key={book.id}><div className="book-cover-wrap">
                  <button type="button" className={`book-cover ${book.dark ? 'cover-dark' : 'cover-light'}`} style={{ backgroundImage: `url(${book.cover})` }}
                    aria-label={`View details for ${book.title}`} onClick={() => setSelectedBook(book)}>
                    <span className="cover-inner" aria-hidden="true"><span className="cover-imprint">MY LIBRARY EDITIONS</span>
                      <span className="cover-title">{book.title}</span><span className="cover-author">{book.author}</span></span>
                  </button>
                  <button className={`book-save ${savedIds.includes(book.id) ? 'book-saved' : ''}`} type="button"
                    aria-label={`${savedIds.includes(book.id) ? 'Remove' : 'Save'} ${book.title} ${savedIds.includes(book.id) ? 'from' : 'to'} your shelf`}
                    aria-pressed={savedIds.includes(book.id)} onClick={() => toggleSave(book)}>
                    <Bookmark size={16} fill={savedIds.includes(book.id) ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button></div>
                  <button className="book-title-button" type="button" onClick={() => setSelectedBook(book)}>{book.title}</button><p>{book.author}</p>
                </article>)}</div> : <div className="empty-shelf"><BookOpen size={29} strokeWidth={1.2} aria-hidden="true" />
                <h4>{savedOnly && !query ? 'Your shelf is waiting.' : 'No stories found just yet.'}</h4>
                <p>{savedOnly && !query ? 'Save a book that speaks to you and it will find a home here.' : 'Try another title, author, or genre.'}</p>
                <button type="button" onClick={showDiscover}>Explore all books <ArrowRight size={15} aria-hidden="true" /></button></div>}
              <div className="library-content-bottom"><span aria-live="polite">{visibleBooks.length} {visibleBooks.length === 1 ? 'story' : 'stories'} to explore</span>
                {visibleBooks.length > 3 && <button type="button" onClick={() => shelfRef.current?.scrollBy({ left: 420, behavior: reduceMotion ? 'auto' : 'smooth' })}>
                  More books <ArrowRight size={16} aria-hidden="true" /></button>}</div>
            </div></div>
          </Reveal>
          <Reveal className="showcase-footnote"><span>Go on, find a book worth staying up for.</span>
            <button type="button" onClick={() => openSignup('Free')}>Make this shelf yours <ArrowUpRight size={17} aria-hidden="true" /></button></Reveal>
        </div></section>

        <section id="benefits" className="benefits-section" aria-labelledby="benefits-title">
          <div className="benefits-copy"><Reveal><span className="section-kicker section-kicker-light">MORE THAN A BOOK LIST / 03</span>
            <h2 id="benefits-title" className="section-title">A little more room for <em>wonder.</em></h2>
            <p className="benefits-description">Not another feed asking for your attention. A quiet corner that gives it back, so you can spend less time deciding and more time lost in a good book.</p>
            <div className="benefit-points"><div><span>01</span><p>Choose your next read with confidence.</p></div>
              <div><span>02</span><p>Remember the stories that stayed with you.</p></div>
              <div><span>03</span><p>Build a reading ritual that feels like yours.</p></div></div>
          </Reveal></div>
          <div className="benefits-image"><img src="/images/reading-moment.jpg" alt="A reader enjoying a book in warm afternoon light by a window" loading="lazy" /></div>
        </section>

        <section id="testimonials" className="testimonials-section section-spacing" aria-labelledby="testimonials-title"><div className="page-container testimonials-layout">
          <Reveal className="testimonials-heading"><span className="section-kicker">FROM ONE READER TO ANOTHER / 04</span>
            <h2 id="testimonials-title" className="section-title">Good stories are <em>better shared.</em></h2></Reveal>
          <div className="testimonial-content"><div className="testimonial-stars" role="img" aria-label="Five out of five stars">
            {Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} fill="currentColor" strokeWidth={1} aria-hidden="true" />)}</div>
            <AnimatePresence mode="wait"><motion.figure className="testimonial-figure" key={testimonialIndex}
              initial={reduceMotion ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
              transition={{ duration: reduceMotion ? 0 : 0.42, ease }}>
              <blockquote>"{testimonials[testimonialIndex].quote}"</blockquote>
              <figcaption><span className="testimonial-avatar" aria-hidden="true">{testimonials[testimonialIndex].name[0]}</span>
                <span><strong>{testimonials[testimonialIndex].name}</strong><small>{testimonials[testimonialIndex].detail}</small></span></figcaption>
            </motion.figure></AnimatePresence>
            <div className="testimonial-controls"><span>0{testimonialIndex + 1} <i /> 0{testimonials.length}</span><div>
              <button type="button" aria-label="Previous reader story" onClick={() => moveTestimonial(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
              <button type="button" aria-label="Next reader story" onClick={() => moveTestimonial(1)}><ChevronRight size={20} aria-hidden="true" /></button>
            </div></div>
          </div>
        </div></section>

        <section id="pricing" className="pricing-section section-spacing" aria-labelledby="pricing-title"><div className="page-container">
          <div className="pricing-heading"><Reveal><span className="section-kicker">A PLACE FOR EVERY READER / 05</span>
            <h2 id="pricing-title" className="section-title">Room to read <em>your way.</em></h2>
            <p className="section-description">Start with a shelf of your own. Grow it whenever you are ready.</p></Reveal>
            <Reveal className="billing-switch" delay={0.12}><span>Billing</span><div role="group" aria-label="Billing frequency">
              <button type="button" className={!yearly ? 'billing-active' : ''} aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
              <button type="button" className={yearly ? 'billing-active' : ''} aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly <small>Save $12</small></button>
            </div></Reveal></div>
          <div className="plans-grid"><Reveal className="plan plan-free"><div className="plan-topline"><span>FREE</span><BookOpen size={23} strokeWidth={1.35} aria-hidden="true" /></div>
            <h3>A lovely place to begin.</h3><p className="plan-description">For finding your next story and keeping your favorites close.</p>
            <div className="plan-price"><strong>$0</strong><span>/ forever</span></div>
            <button className="plan-button plan-button-outline" type="button" onClick={() => openSignup('Free')}>Start for free <ArrowUpRight size={18} aria-hidden="true" /></button>
            <div className="plan-divider" /><p className="plan-includes">EVERYTHING YOU NEED TO START</p><ul>
              <li><Check size={17} aria-hidden="true" /> Save up to 30 books</li><li><Check size={17} aria-hidden="true" /> Discover thoughtful picks</li>
              <li><Check size={17} aria-hidden="true" /> Track what you are reading</li></ul>
          </Reveal>
          <Reveal className="plan plan-plus" delay={0.1}><div className="plan-topline"><span>PLUS</span><span className="plan-note">FOR THE ALWAYS-READING</span></div>
            <h3>For every chapter ahead.</h3><p className="plan-description">A little more space for the stories that make you, you.</p>
            <div className="plan-price"><strong>${yearly ? '5' : '6'}</strong><span>/ month</span></div><p className="plan-billing">{yearly ? 'Billed $60 yearly' : 'Billed monthly'}</p>
            <button className="plan-button plan-button-light" type="button" onClick={() => openSignup('Plus')}>Choose Plus <ArrowUpRight size={18} aria-hidden="true" /></button>
            <div className="plan-divider" /><p className="plan-includes">EVERYTHING IN FREE, PLUS</p><ul>
              <li><Check size={17} aria-hidden="true" /> Unlimited personal shelves</li><li><Check size={17} aria-hidden="true" /> Notes and favorite passages</li>
              <li><Check size={17} aria-hidden="true" /> Gentle reading insights</li></ul>
          </Reveal></div>
          <p className="pricing-footnote">No credit card needed to start. Membership is for organizing your reading, not ebook access.</p>
        </div></section>

        <section id="faq" className="faq-section section-spacing" aria-labelledby="faq-title"><div className="page-container faq-layout">
          <Reveal className="faq-heading"><span className="section-kicker">A FEW GOOD QUESTIONS / 06</span>
            <h2 id="faq-title" className="section-title">Curious? <em>We get it.</em></h2>
            <p className="section-description">Here is everything you need to know before you settle in.</p>
            <a href="mailto:hello@mylibrary.app?subject=Question%20about%20My%20library" className="faq-contact">Still have a question? Say hello <ArrowUpRight size={17} aria-hidden="true" /></a>
          </Reveal>
          <div className="faq-list">{faqs.map((faq, index) => <Reveal key={faq.question} delay={index * 0.055}>
            <div className={`faq-item ${openFaq === index ? 'faq-open' : ''}`}><h3><button type="button" aria-expanded={openFaq === index}
              aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
              <span>{faq.question}</span><ChevronDown size={20} strokeWidth={1.6} aria-hidden="true" /></button></h3>
              <div id={`faq-answer-${index}`}><AnimatePresence initial={false}>{openFaq === index && <motion.div className="faq-answer"
                initial={reduceMotion ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={reduceMotion ? undefined : { height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3, ease }}>
                <p>{faq.answer}</p></motion.div>}</AnimatePresence></div>
            </div></Reveal>)}</div>
        </div></section>

        <section className="final-cta" aria-labelledby="final-cta-title"><div className="final-cta-glow" aria-hidden="true" />
          <div className="page-container final-cta-inner"><div><span className="section-kicker section-kicker-light">THE NEXT PAGE IS YOURS</span>
            <h2 id="final-cta-title">Your next favorite story is <em>waiting.</em></h2>
            <p>Come on in. There is always room for one more book.</p>
            <button className="button button-cream" type="button" onClick={() => openSignup('Free')}>Start your library for free <ArrowUpRight size={18} aria-hidden="true" /></button>
          </div></div>
        </section>
      </main>

      <footer className="site-footer"><div className="page-container"><div className="footer-main">
        <div className="footer-brand-block"><Brand light /><p>A beautiful home for your reading life.</p></div>
        <div className="footer-links"><div><span>EXPLORE</span><a href="#library">The library</a><a href="#features">The experience</a><a href="#benefits">Why it matters</a></div>
          <div><span>MY LIBRARY</span><a href="#testimonials">Reader stories</a><a href="#pricing">Membership</a><a href="#faq">FAQs</a></div>
          <div><span>GET IN TOUCH</span><a href="mailto:hello@mylibrary.app">Say hello</a><button type="button" onClick={() => openSignup('Free')}>Start your shelf</button></div></div>
      </div><div className="footer-bottom"><span>&copy; {new Date().getFullYear()} My library. Made for the love of reading.</span>
        <button type="button" onClick={() => scrollTo('top')}>Back to top <ArrowUp size={15} aria-hidden="true" /></button></div></div></footer>

      <AnimatePresence>
        {selectedBook && <Dialog key="book-dialog" labelledBy="book-dialog-title" onClose={() => setSelectedBook(null)} className="book-dialog">
          <button className="dialog-close" type="button" aria-label="Close book details" onClick={() => setSelectedBook(null)}><X size={21} aria-hidden="true" /></button>
          <div className="book-dialog-cover" style={{ backgroundImage: `url(${selectedBook.cover})` }} aria-hidden="true" />
          <div className="book-dialog-copy"><span className="section-kicker">A STORY TO EXPLORE</span><h2 id="book-dialog-title">{selectedBook.title}</h2>
            <p className="book-dialog-author">by {selectedBook.author} <span aria-hidden="true">&middot;</span> {selectedBook.genre}</p>
            <p className="book-dialog-description">{selectedBook.description}</p>
            <button className="button button-dark" type="button" onClick={() => toggleSave(selectedBook)}>
              <Bookmark size={17} fill={savedIds.includes(selectedBook.id) ? 'currentColor' : 'none'} aria-hidden="true" />
              {savedIds.includes(selectedBook.id) ? 'Saved to your shelf' : 'Save to my shelf'}</button>
            <button className="book-dialog-back" type="button" onClick={() => setSelectedBook(null)}>Keep exploring <ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        </Dialog>}
        {signupPlan && <Dialog key="signup-dialog" labelledBy="signup-dialog-title" onClose={() => setSignupPlan(null)} className="signup-dialog">
          <button className="dialog-close" type="button" aria-label="Close sign up" onClick={() => setSignupPlan(null)}><X size={21} aria-hidden="true" /></button>
          {!signupSuccess ? <><span className="section-kicker">YOUR NEXT CHAPTER</span><h2 id="signup-dialog-title">Make this space <em>yours.</em></h2>
            <p className="signup-intro">Begin your {signupPlan} shelf and keep the books that speak to you in one place.</p>
            <form onSubmit={handleSignup}><label htmlFor="signup-name">Your name</label>
              <input id="signup-name" data-autofocus type="text" autoComplete="name" required maxLength={60} placeholder="What should we call you?" value={name} onChange={(event) => setName(event.target.value)} />
              <label htmlFor="signup-email">Email address</label>
              <input id="signup-email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              <button className="button button-dark" type="submit">Continue with {signupPlan} <ArrowUpRight size={18} aria-hidden="true" /></button></form>
            <p className="signup-note">This preview saves your details on this device. No payment is collected.</p>
          </> : <div className="signup-success"><div className="success-icon"><Check size={25} aria-hidden="true" /></div>
            <span className="section-kicker">WELCOME IN</span><h2 id="signup-dialog-title" ref={successHeadingRef} tabIndex={-1}>A shelf with your name on it, <em>{name.trim()}.</em></h2>
            <p>Your reading space is ready to explore. Save a story that catches your eye to begin.</p>
            <button className="button button-dark" type="button" onClick={() => { setSignupPlan(null); window.setTimeout(browseBooks, 380); }}>
              Explore your library <ArrowUpRight size={18} aria-hidden="true" /></button></div>}
        </Dialog>}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: 12 }} transition={{ duration: reduceMotion ? 0 : 0.25 }}>
        <Check size={17} aria-hidden="true" /> {toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

export default App;

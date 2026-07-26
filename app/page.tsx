export default function HomePage() {
  const sampleCategories = ['Традиционные блюда', 'Выпечка', 'Мясные блюда', 'Напитки'];

  const sampleDishes = [
    {
      id: '1',
      title: 'Жижиг-галнаш',
      description: 'Традиционное чеченское блюдо: отварное мясо с галушками из кукурузной или пшеничной муки и чесночным соусом.',
      price: '350 EGP',
      category: 'Традиционные блюда',
      badge: 'Популярное',
    },
    {
      id: '2',
      title: 'Хингалш',
      description: 'Тонкие лепёшки с начинкой из сочной варёной тыквы, смазанные топлёным маслом.',
      price: '180 EGP',
      category: 'Выпечка',
      badge: 'Фирменное',
    },
    {
      id: '3',
      title: 'Чепалгаш',
      description: 'Традиционные чеченские лепёшки с нежным творогом и зелёным луком.',
      price: '190 EGP',
      category: 'Выпечка',
      badge: null,
    },
    {
      id: '4',
      title: 'Шашлык из баранины',
      description: 'Сочная баранина, маринованная по горскому рецепту и обжаренная на углях.',
      price: '420 EGP',
      category: 'Мясные блюда',
      badge: 'Хит',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-deep-forest) 0%, #2A523D 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '60px 40px',
        color: 'var(--color-vanilla-cream)',
        marginBottom: '50px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
          <span className="badge badge-marigold" style={{ marginBottom: '16px' }}>Кавказское кафе в Каире</span>
          <h1 style={{ color: 'var(--color-vanilla-cream)', fontSize: '3rem', lineHeight: '1.15', marginBottom: '16px' }}>
            Подлинный вкус кавказской кухни
          </h1>
          <p style={{ color: 'rgba(249, 245, 236, 0.85)', fontSize: '1.1rem', marginBottom: '28px' }}>
            Готовим с любовью и доставкой по всему Каиру. Выберите блюда, а мы позаботимся о качественной и быстрой доставке.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#menu" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Смотреть меню
            </a>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section id="menu" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Наше меню</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Выберите категорию блюд</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '32px' }}>
          {sampleCategories.map((cat, i) => (
            <button
              key={i}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                border: i === 0 ? 'none' : '1px solid var(--color-border)',
                backgroundColor: i === 0 ? 'var(--color-deep-forest)' : 'var(--color-surface)',
                color: i === 0 ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {sampleDishes.map((dish) => (
            <div key={dish.id} className="card-menu">
              <div>
                {dish.badge && (
                  <span className="badge badge-marigold" style={{ marginBottom: '12px' }}>
                    {dish.badge}
                  </span>
                )}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{dish.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '16px', minHeight: '60px' }}>
                  {dish.description}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-deep-forest)' }}>
                  {dish.price}
                </span>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  + В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

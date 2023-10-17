export default function Panel({ ...props }) {
  // desired functionality: slide panel to side on hover
  // mouse enters section
  // state updates to value of targeted section (still or life)
  // if value of state is still, grid columns on main element becomes 80% 20%
  // if value of state is life, grid columns on main element becomes 20% 80%
  // slides are animated
  // if mouse hovers over biography, value of state returns to null

  return (
    <section className={props.vals.className}>
      <h3 className="text-4xl tracking-tighter">{props.vals.title}</h3>
    </section>
  );
}

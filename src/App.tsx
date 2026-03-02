import { Header } from "@/components/Header";
import { PortfolioTable } from "@/components/PortfolioTable";
import { RebalanceTable } from "@/components/RebalanceTable";
import { PortfolioChart } from "@/components/PortfolioChart";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Top section: table + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Портфель
            </h2>
            <PortfolioTable />
          </section>

          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Структура
            </h2>
            <PortfolioChart />
          </section>
        </div>

        <hr className="border-border" />

        {/* Rebalance section */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Ребалансировка
          </h2>
          <RebalanceTable />
        </section>
      </main>
    </div>
  );
}

export default App;

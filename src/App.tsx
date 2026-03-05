import { Header } from "@/components/Header";
import { PortfolioTable } from "@/components/PortfolioTable";
import { RebalanceTable } from "@/components/RebalanceTable";
import { PortfolioChart } from "@/components/PortfolioChart";
import { useSettingsStore } from "@/store/settingsStore";

function App() {
  const { t } = useSettingsStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {t.portfolio}
            </h2>
            <PortfolioTable />
          </section>

          <section>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {t.structure}
            </h2>
            <PortfolioChart />
          </section>
        </div>

        <hr className="border-border" />

        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {t.rebalancing}
          </h2>
          <RebalanceTable />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-6">
        <p className="text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://standartsoftplus.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-2 transition-colors"
          >
            StandartSoftPlus
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

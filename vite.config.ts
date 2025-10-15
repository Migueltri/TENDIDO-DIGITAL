import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";

const base = "/";
const isPreview = !!process.env.IS_PREVIEW;

export default defineConfig({
  // Variables globales disponibles en el código
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
  },

  // Limpieza del código final
  esbuild: {
    drop: ["console", "debugger"],
  },

  // Plugins de React y AutoImport
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          react: [
            "React",
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
        {
          "react-i18next": ["useTranslation", "Trans"],
        },
      ],
      dts: true,
    }),
  ],

  // BASE correcta para que Vercel sirva las rutas SPA
  base: "/",

  // Configuración de compilación
  build: {
    sourcemap: true,
    outDir: "dist",
  },

  // Alias de rutas
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  // Servidor local
  server: {
    port: 3000,
    host: "0.0.0.0",
    open: true,
    historyApiFallback: true, // Reescribe todas las rutas a index.html (como en producción)
  },
});

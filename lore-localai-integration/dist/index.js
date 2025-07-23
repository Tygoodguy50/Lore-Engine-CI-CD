"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const conflict_routes_1 = __importDefault(require("./routes/conflict.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/lore/conflicts', conflict_routes_1.default);
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'lore-localai-integration',
        version: '1.0.0'
    });
});
app.get('/', (req, res) => {
    res.json({
        message: 'Lore-LocalAI Integration API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            conflicts: {
                analyze: '/lore/conflicts/analyze',
                history: '/lore/conflicts/history',
                stats: '/lore/conflicts/stats',
                health: '/lore/conflicts/health'
            },
            docs: '/docs'
        }
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Lore-LocalAI Integration server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map
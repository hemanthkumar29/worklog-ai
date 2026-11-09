pub mod hardware;
pub mod fallback;
pub mod engine;

pub use hardware::{detect_hardware, HardwareProfileDto};
pub use fallback::{AIStructuredOutput, DeterministicNLPEngine};
pub use engine::{ActivityContextItem, EnhancementRequest, HybridAIEngine, LocalAIEngine};

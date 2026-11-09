use serde::{Deserialize, Serialize};
use sysinfo::System;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareProfileDto {
    pub total_memory_bytes: u64,
    pub available_memory_bytes: u64,
    pub cpu_cores: usize,
    pub cpu_architecture: String,
    pub has_metal_support: bool,
    pub has_avx2_support: bool,
    pub recommended_engine: String,
}

pub fn detect_hardware() -> HardwareProfileDto {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_memory = sys.total_memory();
    let available_memory = sys.available_memory();
    let cpu_cores = sys.cpus().len();
    let cpu_arch = std::env::consts::ARCH.to_string();

    #[cfg(target_os = "macos")]
    let has_metal = cpu_arch == "aarch64";
    #[cfg(not(target_os = "macos"))]
    let has_metal = false;

    #[cfg(target_arch = "x86_64")]
    let has_avx2 = is_x86_feature_detected!("avx2");
    #[cfg(not(target_arch = "x86_64"))]
    let has_avx2 = false;

    // Recommend HYBRID/LOCAL_GGUF if RAM >= 6GB, otherwise DETERMINISTIC_NLP
    let total_gb = total_memory / (1024 * 1024 * 1024);
    let recommended = if total_gb >= 6 {
        "HYBRID".to_string()
    } else {
        "DETERMINISTIC_NLP".to_string()
    };

    HardwareProfileDto {
        total_memory_bytes: total_memory,
        available_memory_bytes: available_memory,
        cpu_cores,
        cpu_architecture: cpu_arch,
        has_metal_support: has_metal,
        has_avx2_support: has_avx2,
        recommended_engine: recommended,
    }
}

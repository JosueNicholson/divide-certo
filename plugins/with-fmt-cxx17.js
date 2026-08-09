const { createRunOncePlugin, withPodfile } = require('@expo/config-plugins');

const marker = '# Configure fmt as C++17 for Xcode compatibility.';

const withFmtCxx17 = (config) =>
  withPodfile(config, (podfileConfig) => {
    if (podfileConfig.modResults.contents.includes(marker)) return podfileConfig;

    const postInstallConfiguration = `
    ${marker}
    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'

      target.build_configurations.each do |build_configuration|
        build_configuration.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
`;
    const podfileEnd = /\n  end\nend\s*$/;

    if (!podfileEnd.test(podfileConfig.modResults.contents)) {
      throw new Error('Unable to add the fmt build configuration to the Podfile.');
    }

    podfileConfig.modResults.contents = podfileConfig.modResults.contents.replace(
      podfileEnd,
      `${postInstallConfiguration}  end\nend\n`,
    );
    return podfileConfig;
  });

module.exports = createRunOncePlugin(withFmtCxx17, 'with-fmt-cxx17', '1.0.0');

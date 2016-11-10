<?php
/**
 * KN_WD_S Theme Customizer.
 *
 * @package KN_WD_S
 */

/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function _kn_wd_s_customize_register( $wp_customize ) {
	$wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
	$wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';
	$wp_customize->get_setting( 'header_textcolor' )->transport = 'postMessage';

	// Add our social link options.
	$wp_customize->add_section(
		'_kn_wd_s_social_links_section',
		array(
			'title'       => esc_html__( 'Social Links', 'kn_wd_s' ),
			'description' => esc_html__( 'These are the settings for social links. Please limit the number of social links to 5.', 'kn_wd_s' ),
			'priority'    => 90,
		)
	);

	// Create an array of our social links for ease of setup.
	$social_networks = array( 'facebook', 'googleplus', 'instagram', 'linkedin', 'twitter' );

	// Loop through our networks to setup our fields.
	foreach ( $social_networks as $network ) {

		$wp_customize->add_setting(
			'_kn_wd_s_' . $network . '_link',
			array(
				'default' => '',
				'sanitize_callback' => '_kn_wd_s_sanitize_customizer_url',
	        )
	    );
	    $wp_customize->add_control(
	        '_kn_wd_s_' . $network . '_link',
	        array(
	            'label'   => sprintf( esc_html__( '%s Link', 'kn_wd_s' ), ucwords( $network ) ),
	            'section' => '_kn_wd_s_social_links_section',
	            'type'    => 'text',
	        )
	    );
	}

	// Add our Footer Customization section section.
	$wp_customize->add_section(
		'_kn_wd_s_footer_section',
		array(
			'title'    => esc_html__( 'Footer Customization', 'kn_wd_s' ),
			'priority' => 90,
		)
	);

	// Add our copyright text field.
	$wp_customize->add_setting(
		'_kn_wd_s_copyright_text',
		array(
			'default' => '',
		)
	);
	$wp_customize->add_control(
		'_kn_wd_s_copyright_text',
		array(
			'label'       => esc_html__( 'Copyright Text', 'kn_wd_s' ),
			'description' => esc_html__( 'The copyright text will be displayed beneath the menu in the footer.', 'kn_wd_s' ),
			'section'     => '_kn_wd_s_footer_section',
			'type'        => 'text',
			'sanitize'    => 'html',
		)
	);
}
add_action( 'customize_register', '_kn_wd_s_customize_register' );

/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function _kn_wd_s_customize_preview_js() {
	wp_enqueue_script( '_kn_wd_s_customizer', get_template_directory_uri() . '/assets/scripts/customizer.js', array( 'customize-preview' ), '20151215', true );
}
add_action( 'customize_preview_init', '_kn_wd_s_customize_preview_js' );

/**
 * Sanitize our customizer text inputs.
 *
 * @param  string $input Text saved in Customizer input fields.
 * @return string        Sanitized output.
 *
 * @author Corey Collins
 */
function _kn_wd_s_sanitize_customizer_text( $input ) {
	return sanitize_text_field( force_balance_tags( $input ) );
}

/**
 * Sanitize our customizer URL inputs.
 *
 * @param  string $input The URL we need to validate.
 * @return string        Sanitized output.
 *
 * @author Corey Collins
 */
function _kn_wd_s_sanitize_customizer_url( $input ) {
	return esc_url( $input );
}

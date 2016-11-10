<?php
/**
 * The template for displaying the search form.
 *
 * @package KN_WD_S
 */

?>

<form method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label for="search-field"><span class="screen-reader-text"><?php esc_html_e( 'To search this site, enter a search term', 'kn_wd_s' ) ?></span></label>
	<input class="search-field" id="search-field" type="text" name="s" value="<?php echo get_search_query() ?>" aria-required="false" autocomplete="off" placeholder="<?php echo esc_attr_x( 'Search', 'kn_wd_s' ) ?>" />
	<button><?php esc_html_e( 'Submit', 'kn_wd_s' ); ?></button>
</form>
